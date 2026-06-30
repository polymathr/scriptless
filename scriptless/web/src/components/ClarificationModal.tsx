import { useState } from 'react';
import { HelpCircle, Send, X } from 'lucide-react';

interface Props {
  question: string;
  options?: string[];
  onSubmit: (answer: string) => void;
  onDismiss: () => void;
}

export default function ClarificationModal({ question, options, onSubmit, onDismiss }: Props) {
  const [custom, setCustom] = useState('');

  if (!question) return null;

  return (
    <div className="absolute inset-0 bg-bg/75 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in">
      <div className="glass animate-slide-up w-[420px] rounded-2xl p-7 flex flex-col gap-5 border border-accent/30 shadow-2xl relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-md bg-surface text-text-dim hover:text-text transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex gap-3.5 items-start">
          <div className="bg-accent/15 p-2.5 rounded-xl flex-shrink-0">
            <HelpCircle size={22} className="text-accent" />
          </div>
          <div>
            <div className="text-[11px] text-accent font-semibold tracking-wider mb-1">
              CLARIFICATION NEEDED
            </div>
            <div className="text-base font-semibold text-text leading-relaxed">
              {question}
            </div>
          </div>
        </div>

        {options && options.length > 0 && (
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onSubmit(opt)}
                className="bg-surface border border-border text-text px-4 py-3 rounded-lg text-left text-sm cursor-pointer hover:bg-accent/10 hover:border-accent/40 transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-text-muted font-medium">OR TYPE YOUR OWN</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="relative">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && custom.trim()) {
                onSubmit(custom.trim());
              }
            }}
            placeholder="Type your answer…"
            className="w-full bg-black/30 border border-border rounded-xl text-text px-4 py-3 text-sm focus:border-accent focus:outline-none transition-colors"
            autoFocus
          />
          <button
            onClick={() => custom.trim() && onSubmit(custom.trim())}
            disabled={!custom.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              custom.trim() ? 'bg-accent' : 'bg-white/5'
            }`}
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}