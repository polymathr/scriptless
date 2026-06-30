import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Zap, LayoutGrid, LogOut, Plus } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col glass">
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-purple-500 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
            S
          </div>
          <div>
            <div className="font-bold text-sm text-text">ScriptLess</div>
            <div className="text-xs text-text-dim">Workflow Engine</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-accent/15 text-accent'
                : 'text-text-dim hover:text-text hover:bg-surface'
            }`}
          >
            <LayoutGrid size={16} />
            Dashboard
          </Link>
          <Link
            to="/editor"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.startsWith('/editor')
                ? 'bg-accent/15 text-accent'
                : 'text-text-dim hover:text-text hover:bg-surface'
            }`}
          >
            <Zap size={16} />
            New Workflow
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
              {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text truncate">{user?.name || user?.email}</div>
              <div className="text-xs text-text-muted">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red hover:bg-red-dim transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}