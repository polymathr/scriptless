const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('scriptless_token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('scriptless_token');
    localStorage.removeItem('scriptless_user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error?.message || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ success: boolean; token: string; user: import('../types').User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name?: string) =>
      request<{ success: boolean; token: string; user: import('../types').User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    me: () =>
      request<{ success: boolean; user: import('../types').User }>('/api/auth/me'),
  },
  workflows: {
    list: () =>
      request<{ success: boolean; workflows: import('../types').Workflow[] }>('/api/workflows'),
    get: (id: string) =>
      request<{ success: boolean; workflow: import('../types').Workflow }>(`/api/workflows/${id}`),
    create: (workflow: Partial<import('../types').Workflow>) =>
      request<{ success: boolean; workflow: import('../types').Workflow }>('/api/workflows', {
        method: 'POST',
        body: JSON.stringify(workflow),
      }),
    update: (id: string, workflow: Partial<import('../types').Workflow>) =>
      request<{ success: boolean; workflow: import('../types').Workflow }>(`/api/workflows/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(workflow),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/workflows/${id}`, { method: 'DELETE' }),
  },
  execute: {
    run: (nodes: import('../types').WorkflowNode[], edges: import('../types').WorkflowEdge[]) =>
      request<{ success: boolean; logs: import('../types').ExecutionLog[]; executionId: string }>('/api/execute', {
        method: 'POST',
        body: JSON.stringify({ nodes, edges }),
      }),
    runWorkflow: (workflowId: string) =>
      request<{ success: boolean; logs: import('../types').ExecutionLog[]; executionId: string }>(`/api/execute/${workflowId}`, {
        method: 'POST',
      }),
  },
  generate: {
    workflow: (history: { role: string; content: string }[], currentWorkflow?: import('../types').Workflow | null) =>
      request<import('../types').GenerateResponse>('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ history, currentWorkflow }),
      }),
  },
  health: {
    check: () =>
      fetch(`${BASE}/api/health`).then(r => r.ok).catch(() => false),
  },
};