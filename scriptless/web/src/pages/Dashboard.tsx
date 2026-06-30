import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Workflow } from '../types';
import { Zap, Plus, Play, Trash2, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.workflows.list(),
  });

  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workflow?')) return;
    setDeleting(id);
    try {
      await api.workflows.delete(id);
      refetch();
    } finally {
      setDeleting(null);
    }
  };

  const workflows = data?.workflows || [];

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text">Your Workflows</h1>
            <p className="text-text-dim mt-1">Build and manage your automation workflows</p>
          </div>
          <Link
            to="/editor"
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            New Workflow
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-text-dim">Loading...</div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-text mb-2">No workflows yet</h3>
            <p className="text-text-dim mb-6">Create your first automation workflow with AI</p>
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Zap size={16} />
              Create Workflow
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf: Workflow) => (
              <div
                key={wf.id}
                className="glass rounded-xl p-5 border border-border hover:border-border-bright transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap size={18} className="text-accent" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(wf.id)}
                      disabled={deleting === wf.id}
                      className="p-1.5 rounded-md hover:bg-red-dim text-red transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <Link to={`/editor/${wf.id}`} className="block">
                  <h3 className="font-semibold text-text mb-1 truncate">{wf.name}</h3>
                  <p className="text-sm text-text-dim line-clamp-2 mb-3">
                    {wf.description || 'No description'}
                  </p>
                </Link>

                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(wf.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Play size={12} />
                    {wf._count?.executions || 0} runs
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex gap-2">
                  <Link
                    to={`/editor/${wf.id}`}
                    className="flex-1 text-center py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => api.execute.runWorkflow(wf.id).catch(console.error)}
                    className="flex-1 text-center py-2 rounded-lg bg-green-dim text-green text-sm font-medium hover:bg-green/20 transition-colors"
                  >
                    Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}