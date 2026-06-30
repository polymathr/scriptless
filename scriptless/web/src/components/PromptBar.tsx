import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

export default function PromptBar({ onSubmit, isGenerating }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isGenerating) inputRef.current?.focus();
  }, [isGenerating]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isGenerating) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const examples = [
    'When I get a Gmail, send a Slack webhook',
    'Every day at 9am, send me an SMS reminder',
    'When webhook fires, send email and log it',
  ];

  return (
    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-[calc(100%-80px)] max-w-[680px] z-30">
      <div className="flex gap-2 mb-2.5 flex-wrap justify-center">
        {!isGenerating &&
          examples.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setValue(ex);
                inputRef.current?.focus();
              }}
              className="bg-bg-2/80 border border-border text-text-dim px-3 py-1.5 rounded-full text-xs cursor-pointer hover:border-accent hover:text-text transition-all backdrop-blur"
            >
              {ex}
            </button>
          ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-2 flex items-center gap-2.5 border border-border/50 shadow-2xl"
      >
        <div
          className={`p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            isGenerating ? 'bg-accent/30' : 'bg-gradient-to-br from-accent to-purple-500'
          }`}
        >
          {isGenerating ? (
            <Loader2 size={18} className="text-white animate-spin" />
          ) : (
            <Sparkles size={18} className="text-white" />
          )}
        </div>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={isGenerating ? 'Thinking…' : 'Describe your automation workflow…'}
          disabled={isGenerating}
          className="flex-1 bg-transparent border-none text-text text-[15px] py-2 px-1 focus:outline-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!value.trim() || isGenerating}
          className="bg-accent text-white px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
        >
          <Send size={16} />
          Send
        </button>
      </form>
    </div>
  );
}