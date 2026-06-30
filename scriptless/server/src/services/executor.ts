import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import { env } from '../config.js';
import { logger } from '../lib/logger.js';
import { createError } from '../middleware/error.js';
import { WorkflowNode, ExecutionLog } from '../types/index.js';

interface ExecuteContext {
  logs: ExecutionLog[];
  nodeResults: Map<string, unknown>;
}

function logEntry(ctx: ExecuteContext, msg: string, level: ExecutionLog['level'] = 'info') {
  const entry: ExecutionLog = { time: new Date().toISOString(), msg, level };
  ctx.logs.push(entry);
  logger.log(level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info', msg);
}

export async function executeWorkflow(nodes: WorkflowNode[], edges: { source: string; target: string; sourceHandle?: string | null }[]): Promise<{ success: boolean; logs: ExecutionLog[] }> {
  const ctx: ExecuteContext = { logs: [], nodeResults: new Map() };

  try {
    const adj = new Map<string, typeof edges>();
    for (const edge of edges) {
      if (!adj.has(edge.source)) adj.set(edge.source, []);
      adj.get(edge.source)!.push(edge);
    }

    const trigger = nodes.find(n => n.type === 'triggerNode');
    if (!trigger) {
      logEntry(ctx, 'No trigger node found', 'error');
      return { success: false, logs: ctx.logs };
    }

    logEntry(ctx, `▶ Starting workflow: "${trigger.data.label}"`);

    const queue: { nodeId: string; handle: string | null }[] = [{ nodeId: trigger.id, handle: null }];
    const visited = new Set<string>();
    let stepCount = 0;
    const MAX_STEPS = 50;

    while (queue.length > 0 && stepCount < MAX_STEPS) {
      const { nodeId } = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      stepCount++;

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      if (node.type === 'triggerNode') {
        logEntry(ctx, `⚡ Trigger: ${node.data.label} — ${node.data.detail || 'Activated'}`);
      } else if (node.type === 'conditionNode') {
        logEntry(ctx, `🔀 Condition: ${node.data.label} — evaluating...`);
        const result = evaluateCondition(node.data.condition || '', ctx);
        logEntry(ctx, `   → Result: ${result ? 'TRUE path' : 'FALSE path'}`);

        const outEdges = adj.get(nodeId) || [];
        for (const edge of outEdges) {
          if (result && edge.sourceHandle === 'true') {
            queue.push({ nodeId: edge.target, handle: edge.sourceHandle });
          } else if (!result && edge.sourceHandle === 'false') {
            queue.push({ nodeId: edge.target, handle: edge.sourceHandle });
          }
        }
        continue;
      } else if (node.type === 'actionNode') {
        logEntry(ctx, `🔧 Action: ${node.data.label}`);
        await executeAction(node.data.config || {}, node.data, ctx);
      }

      const outEdges = adj.get(nodeId) || [];
      for (const edge of outEdges) {
        queue.push({ nodeId: edge.target, handle: edge.sourceHandle || null });
      }
    }

    if (stepCount >= MAX_STEPS) {
      logEntry(ctx, '⚠ Max steps reached — workflow may have a cycle', 'warn');
    }

    logEntry(ctx, '✅ Workflow complete');
    return { success: true, logs: ctx.logs };
  } catch (err) {
    logEntry(ctx, `❌ Execution error: ${(err as Error).message}`, 'error');
    return { success: false, logs: ctx.logs };
  }
}

function evaluateCondition(condition: string, _ctx: ExecuteContext): boolean {
  if (!condition) return true;
  // Simple heuristic: look for keywords that suggest false
  const falseKeywords = ['false', 'no', '0', 'empty', 'null', 'undefined'];
  const lower = condition.toLowerCase();
  return !falseKeywords.some(k => lower.includes(k));
}

async function executeAction(config: Record<string, unknown>, nodeData: WorkflowNode['data'], ctx: ExecuteContext) {
  const type = (config.type as string) || 'log';

  if (type === 'send_email') {
    await handleEmail(config, ctx);
  } else if (type === 'send_sms') {
    await handleSMS(config, ctx);
  } else if (type === 'http_request') {
    await handleHTTP(config, ctx);
  } else if (type === 'delay') {
    await handleDelay(config, ctx);
  } else {
    logEntry(ctx, `   📝 Log: ${(config.message as string) || nodeData.detail || 'No message'}`);
  }
}

async function handleEmail(config: Record<string, unknown>, ctx: ExecuteContext) {
  const to = config.to as string | undefined;
  const subject = config.subject as string | undefined;
  const body = config.body as string | undefined;

  if (!to) {
    logEntry(ctx, '   ⚠ Email: no recipient configured (simulating)', 'warn');
    return;
  }

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    logEntry(ctx, `   📧 [SIMULATED] Email to ${to} — Subject: "${subject}"`, 'warn');
    logEntry(ctx, '   ℹ Set SMTP_HOST, SMTP_USER, SMTP_PASS to send real emails', 'warn');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject: subject || 'ScriptLess Automation',
      text: body || '',
    });
    logEntry(ctx, `   ✅ Email sent to ${to}`);
  } catch (err) {
    logEntry(ctx, `   ❌ Email failed: ${(err as Error).message}`, 'error');
  }
}

async function handleSMS(config: Record<string, unknown>, ctx: ExecuteContext) {
  const to = config.to as string | undefined;
  const message = config.message as string | undefined;

  if (!to) {
    logEntry(ctx, '   ⚠ SMS: no recipient configured (simulating)', 'warn');
    return;
  }

  if (!env.TWILIO_SID || !env.TWILIO_TOKEN || !env.TWILIO_FROM) {
    logEntry(ctx, `   📱 [SIMULATED] SMS to ${to}: "${message}"`, 'warn');
    logEntry(ctx, '   ℹ Set TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM for real SMS', 'warn');
    return;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${env.TWILIO_SID}:${env.TWILIO_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: env.TWILIO_FROM, To: to, Body: message || '' }),
      }
    );
    const data = await response.json() as { sid?: string; message?: string };
    if (data.sid) {
      logEntry(ctx, `   ✅ SMS sent to ${to} (SID: ${data.sid})`);
    } else {
      logEntry(ctx, `   ❌ SMS failed: ${data.message}`, 'error');
    }
  } catch (err) {
    logEntry(ctx, `   ❌ SMS failed: ${(err as Error).message}`, 'error');
  }
}

async function handleHTTP(config: Record<string, unknown>, ctx: ExecuteContext) {
  const method = (config.method as string) || 'POST';
  const url = config.url as string | undefined;
  const body = config.body as Record<string, unknown> | undefined;
  const customHeaders = (config.headers as Record<string, string>) || {};

  if (!url) {
    logEntry(ctx, '   ⚠ HTTP: no URL configured (simulating)', 'warn');
    return;
  }

  logEntry(ctx, `   🌐 ${method} ${url}`);

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...customHeaders },
      body: method !== 'GET' ? JSON.stringify(body || {}) : undefined,
    });
    logEntry(ctx, `   ✅ HTTP ${response.status} ${response.statusText}`);
  } catch (err) {
    logEntry(ctx, `   ❌ HTTP failed: ${(err as Error).message}`, 'error');
  }
}

async function handleDelay(config: Record<string, unknown>, ctx: ExecuteContext) {
  const secs = Math.min(parseInt((config.seconds as string) || '1', 10), 30);
  logEntry(ctx, `   ⏱ Waiting ${secs}s...`);
  await new Promise(r => setTimeout(r, secs * 1000));
  logEntry(ctx, '   ✅ Delay complete');
}