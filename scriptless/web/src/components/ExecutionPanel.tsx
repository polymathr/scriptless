import { useState, useRef, useEffect } from 'react';
import { Play, Square, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useWorkflowStore } from '../store/workflowStore';
import { ExecutionLog } from '../types';

const levelColors = {
  info: 'text-text-dim',
  error: 'text-red',
  warn: 'text-amber',
};

const statusIcons = {
  idle: <Zap size={14} className="text-text-dim" />,
  running: <Loader2 size={14} className="text-accent animate-spin" />,
  done: <CheckCircle size={14} className="text-green" />,
  error: <AlertCircle size={14} className="text-red" />,
};

export default function ExecutionPanel() {
  const { nodes, edges } = useWorkflowStore();
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  if (!nodes.length) return null;

  const handleRun = async () => {
    setStatus('running');
    setLogs([]);

    try {
      const result = await api.execute.run(nodes, edges);
      setLogs(result.logs || []);
      setStatus(result.success ? 'done' : 'error');
    } catch (err) {
      setLogs([{ time: new Date().toISOString(), msg: `Connection failed: ${(err as Error).message}`, level: 'error' }]);
      setStatus('error');
    }
  };

  const buttonBg = {
    idle: 'bg-accent',
    running: 'bg-accent/40',
    done: 'bg-green',
    error: 'bg-red',
  }[status];

  return (
    <div className="glass animate-slide-up absolute bottom-28 right-5 w-80 rounded-xl p-4 z-40 flex flex-col gap-3 border border-border/50 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusIcons[status]}
          <span className="text-[13px] font-semibold">Execution Engine</span>
        </div>
        <span className="text-[11px] text-text-muted">
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <button
        onClick={handleRun}
        disabled={status === 'running'}
        className={`w-full text-white py-2 rounded-lg font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors disabled:opacity-70 ${buttonBg}`}
      >
        {status === 'running' ? (
          <>
            <Square size={14} /> Running…
          </>
        ) : (
          <>
            <Play size={14} /> Deploy & Run
          </>
        )}
      </button>

      {logs.length > 0 && (
        <div
          ref={logsRef}
          className="bg-black/40 rounded-lg p-2.5 max-h-44 overflow-y-auto scrollbar-thin flex flex-col gap-1"
        >
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 text-[11px] font-mono leading-relaxed">
              <span className="text-text-muted flex-shrink-0">
                {new Date(log.time).toLocaleTimeString('en', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span className={levelColors[log.level] || 'text-text-dim'}>{log.msg}</span>
            </div>
          ))}
        </div>
      )}

      {logs.length === 0 && status === 'idle' && (
        <div className="text-xs text-text-muted text-center py-1">
          Click "Deploy & Run" to execute your workflow
        </div>
      )}

      <div className="text-[11px] text-text-muted leading-relaxed">
        Real email/SMS requires env vars in <code className="text-text-dim text-[10px]">server/.env</code>
      </div>
    </div>
  );
}