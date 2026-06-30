import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { api } from '../lib/api';
import { useWorkflowStore } from '../store/workflowStore';
import { WorkflowNode, WorkflowEdge } from '../types';
import NodePalette from '../components/NodePalette';
import PropertiesPanel from '../components/PropertiesPanel';
import PromptBar from '../components/PromptBar';
import ExecutionPanel from '../components/ExecutionPanel';
import ClarificationModal from '../components/ClarificationModal';
import { nodeTypes } from '../components/CustomNodes';
import { getLayoutedElements } from '../utils/layout';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

function Canvas() {
  const { nodes, edges, setNodesAndEdges, addNode, setSelectedNodeId, addEdge, clearWorkflow } = useWorkflowStore();
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow') as WorkflowNode['type'];
    if (!type) return;
    addNode(type, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
  }, [screenToFlowPosition, addNode]);

  const onConnect = useCallback((params: any) => {
    addEdge({
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
    });
  }, [addEdge]);

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes.map(n => ({ ...n, selected: false }))}
        edges={edges}
        onNodesChange={(changes) => {
          // Handle node changes manually
        }}
        onEdgesChange={() => {}}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode="Delete"
        style={{ background: '#0b0d14' }}
      >
        <Background color="#ffffff" gap={28} opacity={0.03} />
        <Controls className="!bg-bg-2/90 !border !border-border !rounded-lg" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'triggerNode') return '#f59e0b';
            if (n.type === 'conditionNode') return '#10b981';
            return '#6366f1';
          }}
          className="!bg-bg-2/90 !border !border-border !rounded-lg"
          maskColor="rgba(11,13,20,0.6)"
        />
      </ReactFlow>
    </div>
  );
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nodes, edges, setNodesAndEdges, clearWorkflow } = useWorkflowStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [clarification, setClarification] = useState<{ text: string; options?: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: existingWorkflow } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => api.workflows.get(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (existingWorkflow?.workflow) {
      setNodesAndEdges(existingWorkflow.workflow.nodes, existingWorkflow.workflow.edges);
    } else if (!id) {
      clearWorkflow();
    }
  }, [existingWorkflow, id, setNodesAndEdges, clearWorkflow]);

  const saveMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; nodes: WorkflowNode[]; edges: WorkflowEdge[] }) =>
      id ? api.workflows.update(id, data) : api.workflows.create(data),
    onSuccess: (res) => {
      if (!id && res.workflow?.id) {
        navigate(`/editor/${res.workflow.id}`);
      }
    },
  });

  const runAI = useCallback(async (newHistory: typeof history) => {
    setIsGenerating(true);
    setError('');
    setClarification(null);

    try {
      const result = await api.generate.workflow(newHistory, { nodes, edges });

      if (result.status === 'needs_info' && result.question) {
        setHistory(h => [...h, { role: 'assistant', content: result.question!.text }]);
        setClarification(result.question);
      } else if (result.status === 'complete' && result.workflow) {
        const { nodes: ln, edges: le } = getLayoutedElements(
          result.workflow.nodes || [],
          result.workflow.edges || [],
          'TB'
        );
        setNodesAndEdges(ln, le);
        setHistory([]);
      } else {
        setError('Unexpected AI response. Please try again.');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to connect to server.');
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, edges, setNodesAndEdges]);

  const handlePrompt = useCallback((prompt: string) => {
    const newHistory = [...history, { role: 'user', content: prompt }];
    setHistory(newHistory);
    runAI(newHistory);
  }, [history, runAI]);

  const handleClarification = useCallback((answer: string) => {
    const newHistory = [...history, { role: 'user', content: answer }];
    setHistory(newHistory);
    runAI(newHistory);
  }, [history, runAI]);

  const handleSave = async () => {
    if (nodes.length === 0) return;
    setSaving(true);
    const name = nodes.find(n => n.type === 'triggerNode')?.data.label || 'Untitled Workflow';
    await saveMutation.mutateAsync({ name, nodes, edges });
    setSaving(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-2/50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-surface rounded-lg text-text-dim">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-semibold text-text text-sm">
              {id ? existingWorkflow?.workflow?.name || 'Loading...' : 'New Workflow'}
            </h2>
            <p className="text-xs text-text-muted">
              {nodes.length} nodes · {edges.length} edges
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nodes.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          )}
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodePalette />
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
        <PropertiesPanel />
        <ExecutionPanel />

        {/* Empty state */}
        {nodes.length === 0 && !isGenerating && !clarification && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className="text-5xl">⚡</div>
            <div className="text-xl font-bold text-text">Describe your automation</div>
            <div className="text-sm text-text-dim text-center max-w-md">
              Type a workflow in plain language below, or drag nodes from the left panel to build manually.
            </div>
          </div>
        )}

        {/* Error toast */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-dim border border-red/40 text-red px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 animate-slide-up z-50">
            <AlertCircle size={14} />
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red/70 hover:text-red">×</button>
          </div>
        )}

        {/* Prompt bar */}
        {!clarification && (
          <PromptBar onSubmit={handlePrompt} isGenerating={isGenerating} />
        )}

        {/* Clarification modal */}
        {clarification && (
          <ClarificationModal
            question={clarification.text}
            options={clarification.options}
            onSubmit={handleClarification}
            onDismiss={() => {
              setClarification(null);
              setHistory([]);
            }}
          />
        )}
      </div>
    </div>
  );
}