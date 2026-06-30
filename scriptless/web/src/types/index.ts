export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  _count?: { executions: number };
}

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

export interface Execution {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  logs: ExecutionLog[];
  startedAt: string;
  finishedAt: string | null;
}

export interface ExecutionLog {
  time: string;
  msg: string;
  level: 'info' | 'warn' | 'error';
}

export interface GenerateResponse {
  status: 'needs_info' | 'complete';
  question?: { text: string; options?: string[] } | null;
  workflow?: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  } | null;
}