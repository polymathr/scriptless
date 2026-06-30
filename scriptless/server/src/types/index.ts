export interface WorkflowNode {
  id: string;
  type: 'triggerNode' | 'actionNode' | 'conditionNode';
  position?: { x: number; y: number };
  data: {
    label: string;
    icon: string;
    detail?: string;
    config?: Record<string, unknown>;
    condition?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  label?: string;
  animated?: boolean;
}

export interface WorkflowPayload {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionLog {
  time: string;
  msg: string;
  level: 'info' | 'warn' | 'error';
}

export interface ExecutionResult {
  success: boolean;
  logs: ExecutionLog[];
  error?: string;
}