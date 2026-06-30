import dagre from 'dagre';
import { WorkflowNode, WorkflowEdge } from '../types';

const W = 230;
const H = 90;

export function getLayoutedElements(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  if (!nodes.length) return { nodes, edges };

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40 });

  nodes.forEach((n) => g.setNode(n.id, { width: W, height: H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return {
    nodes: nodes.map((n) => {
      const pos = g.node(n.id);
      return {
        ...n,
        targetPosition: direction === 'TB' ? 'top' : 'left',
        sourcePosition: direction === 'TB' ? 'bottom' : 'right',
        position: { x: pos.x - W / 2, y: pos.y - H / 2 },
      };
    }),
    edges: edges.map((e) => ({
      ...e,
      animated: true,
      style: {
        stroke: e.label === 'False' ? '#ef4444' : '#6366f1',
        strokeWidth: 2,
      },
      labelBgStyle: { fill: '#0b0d14', fillOpacity: 0.9 },
      labelStyle: { fill: '#eeeef2', fontWeight: 600, fontSize: 11 },
    })),
  };
}