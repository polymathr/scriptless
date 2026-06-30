import { useState, useEffect } from 'react';
import { Settings, X, Save, Trash2, Mail, MessageSquare, Globe, Clock, FileText } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';

const ACTION_TYPES = [
  { value: 'log', label: 'Log Message', icon: FileText },
  { value: 'send_email', label: 'Send Email', icon: Mail },
  { value: 'send_sms', label: 'Send SMS', icon: MessageSquare },
  { value: 'http_request', label: 'HTTP Request', icon: Globe },
  { value: 'delay', label: 'Delay', icon: Clock },
];

export default function PropertiesPanel() {
  const { nodes, selectedNodeId, updateNodeData, setSelectedNodeId, deleteNode } = useWorkflowStore();
  const node = nodes.find((n) => n.id === selectedNodeId);

  const [form, setForm] = useState({ label: '', detail: '', icon: '', config: {} as Record<string, unknown> });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (node) {
      setForm({
        label: node.data.label || '',
        detail: node.data.detail || '',
        icon: node.data.icon || '',
        config: node.data.config || {},
      });
      setSaved(false);
    }
  }, [node?.id]);

  if (!node) return null;

  const setField = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));
  const setConfig = (key: string, val: unknown) => setForm((f) => ({ ...f, config: { ...f.config, [key]: val } }));

  const handleSave = () => {
    updateNodeData(node.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isAction = node.type === 'actionNode';
  const cfgType = (form.config?.type as string) || 'log';

  return (
    <div className="glass animate-slide-up absolute right-5 top-5 w-80 rounded-xl p-5 flex flex-col gap-4 z-50 max-h-[calc(100vh-40px)] overflow-y-auto scrollbar-thin border border-border shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={15} className="text-accent" />
          <span className="text-[13px] font-semibold">Node Properties</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => deleteNode(node.id)}
            className="p-1.5 rounded-md bg-red-dim border border-red/20 text-red hover:bg-red/20 transition-colors"
            title="Delete node"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1.5 rounded-md bg-surface text-text-dim hover:bg-surface-hover transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <label className="block text-[11px] font-medium text-text-dim mb-1.5">Label</label>
        <input
          value={form.label}
          onChange={(e) => setField('label', e.target.value)}
          className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
          placeholder="Node label"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-text-dim mb-1.5">Detail / Description</label>
        <input
          value={form.detail}
          onChange={(e) => setField('detail', e.target.value)}
          className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
          placeholder="Brief description"
        />
      </div>

      {isAction && (
        <>
          <div className="h-px bg-border" />
          <div className="text-[11px] font-semibold text-accent tracking-wider">ACTION CONFIGURATION</div>

          <div>
            <label className="block text-[11px] font-medium text-text-dim mb-1.5">Action Type</label>
            <select
              value={cfgType}
              onChange={(e) => setConfig('type', e.target.value)}
              className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm text-text cursor-pointer focus:border-accent focus:outline-none transition-colors"
            >
              {ACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {cfgType === 'send_email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-text-dim mb-1.5">To (email)</label>
                <input
                  value={(form.config.to as string) || ''}
                  onChange={(e) => setConfig('to', e.target.value)}
                  className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-dim mb-1.5">Subject</label>
                <input
                  value={(form.config.subject as string) || ''}
                  onChange={(e) => setConfig('subject', e.target.value)}
                  className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-dim mb-1.5">Body</label>
                <textarea
                  value={(form.config.body as string) || ''}
                  onChange={(e) => setConfig('body', e.target.value)}
                  className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text min-h-[80px] resize-y focus:border-accent focus:outline-none transition-colors"
                  placeholder="Email body…"
                />
              </div>
            </div>
          )}

          {cfgType === 'send_sms' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-text-dim mb-1.5">To (phone)</label>
                <input
                  value={(form.config.to as string) || ''}
                  onChange={(e) => setConfig('to', e.target.value)}
                  className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
                  placeholder="+12125551234"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-dim mb-1.5">Message</label>
                <textarea
                  value={(form.config.message as string) || ''}
                  onChange={(e) => setConfig('message', e.target.value)}
                  rows={3}
                  className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text resize-y focus:border-accent focus:outline-none transition-colors"
                  placeholder="SMS message…"
                />
              </div>
            </div>
          )}

          {cfgType === 'http_request' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-text-dim mb-1.5">Method</label>
                <select
                  value={(form.config.method as string) || 'POST'}
                  onChange={(e) => setConfig('method', e.target.value)}
                  className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
                >
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-dim mb-1.5">URL</label>
                <input
                  value={(form.config.url as string) || ''}
                  onChange={(e) => setConfig('url', e.target.value)}
                  className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
                  placeholder="https://hooks.slack.com/…"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-dim mb-1.5">Body (JSON)</label>
                <textarea
                  value={typeof form.config.body === 'string' ? form.config.body : JSON.stringify(form.config.body || {}, null, 2)}
                  onChange={(e) => setConfig('body', e.target.value)}
                  className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text font-mono min-h-[80px] resize-y focus:border-accent focus:outline-none transition-colors"
                  placeholder='{"text":"Hello!"}'
                />
              </div>
            </div>
          )}

          {cfgType === 'delay' && (
            <div>
              <label className="block text-[11px] font-medium text-text-dim mb-1.5">Delay (seconds)</label>
              <input
                type="number"
                min={1}
                max={3600}
                value={(form.config.seconds as number) || 30}
                onChange={(e) => setConfig('seconds', parseInt(e.target.value))}
                className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          )}

          {cfgType === 'log' && (
            <div>
              <label className="block text-[11px] font-medium text-text-dim mb-1.5">Message to log</label>
              <input
                value={(form.config.message as string) || ''}
                onChange={(e) => setConfig('message', e.target.value)}
                className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
                placeholder="Log message…"
              />
            </div>
          )}
        </>
      )}

      <button
        onClick={handleSave}
        className={`w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-colors mt-1 ${
          saved ? 'bg-green hover:bg-green/90' : 'bg-accent hover:bg-accent/90'
        }`}
      >
        {saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  );
}