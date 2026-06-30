import { Handle, Position } from 'reactflow';
import {
  Mail, MessageSquare, MapPin, Lightbulb, Music, Zap, Bot,
  HelpCircle, SplitSquareHorizontal, Globe, Clock, Filter,
  Send, Smartphone, Webhook, Play,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Mail, MessageSquare, MapPin, Lightbulb, Music, Zap, Bot,
  HelpCircle, SplitSquareHorizontal, Globe, Clock, Filter,
  Send, Smartphone, Webhook, Play,
};

interface BaseNodeProps {
  data: {
    label: string;
    icon: string;
    detail?: string;
    config?: Record<string, unknown>;
    condition?: string;
  };
  selected?: boolean;
  variant: 'trigger' | 'action' | 'condition';
}

function BaseNode({ data, selected, variant }: BaseNodeProps) {
  const Icon = ICONS[data.icon] || Zap;

  const theme = {
    trigger: { border: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '#f59e0b' },
    action: { border: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '#6366f1' },
    condition: { border: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '#10b981' },
  }[variant];

  const hasConfig = data.config && Object.keys(data.config).length > 0;

  return (
    <div
      className="bg-bg-2/95 rounded-xl w-56 p-3.5 cursor-pointer transition-all relative"
      style={{
        border: `1px solid ${selected ? theme.border : 'rgba(255,255,255,0.1)'}`,
        borderLeft: `3px solid ${theme.border}`,
        boxShadow: selected
          ? `0 0 0 2px ${theme.border}40, 0 8px 32px rgba(0,0,0,0.5)`
          : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="rounded-lg p-1.5 flex items-center justify-center flex-shrink-0"
          style={{ background: theme.bg }}
        >
          <Icon size={16} color={theme.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13px] text-text truncate">{data.label}</div>
          {data.detail && (
            <div className="text-[11px] text-text-dim truncate">{data.detail}</div>
          )}
        </div>
        {hasConfig && (
          <div className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" title="Action configured" />
        )}
      </div>

      {variant !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: theme.border, width: 9, height: 9, border: '2px solid #0b0d14' }}
        />
      )}

      {variant === 'condition' ? (
        <>
          <Handle
            type="source"
            id="true"
            position={Position.Bottom}
            style={{ left: '28%', background: '#10b981', width: 9, height: 9, border: '2px solid #0b0d14' }}
          />
          <Handle
            type="source"
            id="false"
            position={Position.Bottom}
            style={{ left: '72%', background: '#ef4444', width: 9, height: 9, border: '2px solid #0b0d14' }}
          />
          <div className="flex justify-between pt-1.5">
            <span className="text-[10px] text-green font-semibold">TRUE</span>
            <span className="text-[10px] text-red font-semibold">FALSE</span>
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: theme.border, width: 9, height: 9, border: '2px solid #0b0d14' }}
        />
      )}
    </div>
  );
}

export const TriggerNode = (p: any) => <BaseNode {...p} variant="trigger" />;
export const ActionNode = (p: any) => <BaseNode {...p} variant="action" />;
export const ConditionNode = (p: any) => <BaseNode {...p} variant="condition" />;

export const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  conditionNode: ConditionNode,
};