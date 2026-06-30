import fetch from 'node-fetch';
import { env } from '../config.js';
import { createError } from '../middleware/error.js';
import { logger } from '../lib/logger.js';
import { WorkflowPayload } from '../types/index.js';

interface GenerateRequest {
  history: { role: string; content: string }[];
  currentWorkflow?: WorkflowPayload | null;
}

interface GenerateResponse {
  status: 'needs_info' | 'complete';
  question?: { text: string; options?: string[] } | null;
  workflow?: WorkflowPayload | null;
}

export async function generateWorkflow(request: GenerateRequest): Promise<GenerateResponse> {
  const { history, currentWorkflow } = request;

  const historyText = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  const prompt = `You are an advanced automation workflow builder for a mobile/web automation app (like Zapier for phones).
Your job is to build a Directed Acyclic Graph (DAG) workflow.

AVAILABLE NODE TYPES:
- triggerNode: Starting point (email received, time schedule, webhook, SMS received, manual)
- actionNode: Executes an action (send email, send SMS, HTTP request, log message, delay)
- conditionNode: Branching logic (if/else based on data)

AVAILABLE ICONS: Mail, MessageSquare, MapPin, Lightbulb, Music, Zap, Bot, HelpCircle, SplitSquareHorizontal, Globe, Clock, Filter, Send, Smartphone, Webhook

EXECUTION CONFIG: Each actionNode's "config" field controls real execution:
- send_email: { type:"send_email", to:"email", subject:"subject", body:"body text" }
- send_sms: { type:"send_sms", to:"+1234567890", message:"text" }
- http_request: { type:"http_request", method:"POST", url:"https://...", body:{} }
- delay: { type:"delay", seconds:30 }
- log: { type:"log", message:"text" }

RULES:
1. Ask clarifying questions (status:"needs_info") until you know the EXACT trigger, action, and parameters.
2. When complete, return status:"complete" with a full workflow JSON including config on every actionNode.
3. For conditionNodes, describe the condition in data.condition field.
4. Keep workflows practical and executable.

=== CONVERSATION ===
${historyText}
===================
${currentWorkflow?.nodes?.length ? `\n=== CURRENT WORKFLOW ===\n${JSON.stringify(currentWorkflow, null, 2)}\n========================\nModify based on latest request.` : ''}

Respond ONLY with valid JSON matching this schema:
{
  "status": "needs_info" | "complete",
  "question": { "text": "...", "options": ["opt1", "opt2"] } | null,
  "workflow": {
    "nodes": [{ "id":"n1", "type":"triggerNode|actionNode|conditionNode", "data":{ "label":"...", "icon":"...", "detail":"...", "config":{} } }],
    "edges": [{ "id":"e1", "source":"n1", "target":"n2", "sourceHandle":"true|false|null", "label":"", "animated":true }]
  } | null
}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    const data = await response.json() as Record<string, unknown>;

    if (data.error) {
      logger.error({ error: data.error }, 'Gemini API error');
      throw createError((data.error as { message?: string }).message || 'Gemini API error', 502, 'AI_ERROR');
    }

    const text = (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] }).candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw createError('Empty response from Gemini', 502, 'AI_ERROR');
    }

    let result: GenerateResponse;
    try {
      result = JSON.parse(text) as GenerateResponse;
    } catch (e) {
      logger.error({ rawText: text }, 'Failed to parse Gemini response');
      throw createError('Invalid JSON from Gemini', 502, 'AI_PARSE_ERROR');
    }

    return result;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw createError('AI generation timed out', 504, 'AI_TIMEOUT');
    }
    throw err;
  }
}