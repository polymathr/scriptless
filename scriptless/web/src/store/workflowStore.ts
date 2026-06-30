import { create } from 'zustand';
import { WorkflowNode, WorkflowEdge } from '../types';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  setNodesAndEdges: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (type: WorkflowNode['type'], position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNode['data']>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Omit<WorkflowEdge, 'id' | 'animated'>) => void;
  deleteEdge: (id: string) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  setNodesAndEdges: (nodes, edges) => set({ nodes, edges, selectedNodeId: null }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  addNode: (type, position) => {
    const labels = {
      triggerNode: 'New Trigger',
      conditionNode: 'New Condition',
      actionNode: 'New Action',
    };
    const icons = {
      triggerNode: 'Zap',
      conditionNode: 'SplitSquareHorizontal',
      actionNode: 'Bot',
    };
    const newNode: WorkflowNode = {
      id: `node-${crypto.randomUUID()}`,
      type,
      position,
      data: {
        label: labels[type],
        icon: icons[type],
        detail: 'Click to configure',
        config: {},
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  updateNodeData: (id, data) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }),
  deleteNode: (id) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    }),
  addEdge: (connection) => {
    const edge: WorkflowEdge = {
      ...connection,
      id: `e-${crypto.randomUUID()}`,
      animated: true,
    };
    set({ edges: [...get().edges, edge] });
  },
  deleteEdge: (id) => set({ edges: get().edges.filter((e) => e.id !== id) }),
  clearWorkflow: () => set({ nodes: [], edges: [], selectedNodeId: null }),
}));