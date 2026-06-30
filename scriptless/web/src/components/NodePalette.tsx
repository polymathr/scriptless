import { Zap, SplitSquareHorizontal, Bot, Info } from 'lucide-react';

const items = [
  {
    type: 'triggerNode' as const,
    label: 'Trigger',
    desc: 'Starts the workflow',
    icon: Zap,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    type: 'conditionNode' as const,
    label: 'Condition',
    desc: 'If / else branching',
    icon: SplitSquareHorizontal,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    type: 'actionNode' as const,
    label: 'Action',
    desc: 'Email, SMS, webhook…',
    icon: Bot,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
  },
];

export default function NodePalette() {
  return (
    <div className="w-56 h-full border-r border-border bg-bg-2/50 flex flex-col p-4 gap-2 z-20 flex-shrink-0">
      <div className="text-[11px] font-semibold text-text-muted tracking-wider mb-2">
        MANUAL NODES
      </div>

      {items.map((item) => (
        <div
          key={item.type}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/reactflow', item.type);
            e.dataTransfer.effectAllowed = 'move';
          }}
          className="bg-opacity-10 border rounded-lg p-3 cursor-grab flex items-center gap-3 transition-colors hover:bg-opacity-20 select-none"
          style={{
            backgroundColor: item.bg,
            borderColor: item.color + '30',
          }}
        >
          <item.icon size={16} color={item.color} />
          <div>
            <div className="text-[13px] font-semibold text-text">{item.label}</div>
            <div className="text-[11px] text-text-dim">{item.desc}</div>
          </div>
        </div>
      ))}

      <div className="mt-auto">
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex gap-2">
          <Info size={14} className="text-accent flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-text-dim leading-relaxed">
            Drag nodes to canvas, or type a prompt below to let AI build the workflow.
          </div>
        </div>
      </div>
    </div>
  );
}