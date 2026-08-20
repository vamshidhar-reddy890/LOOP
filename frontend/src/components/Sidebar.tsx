import { BarChart3, Home, MessageSquare, Settings, UserCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const links: Array<{ to: string; label: string; icon: typeof Home; roles: UserRole[] }> = [
  { to: '/dashboard', label: 'Dashboard', icon: Home, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare, roles: ['ADMIN', 'ANALYST'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
  { to: '/profile', label: 'Profile', icon: UserCircle, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
];

export default function Sidebar() {
  const { user } = useAuth();

  const visibleLinks = links.filter(({ roles }) => user && roles.includes(user.role));

  return (
    <aside className="hidden min-h-screen w-72 border-r border-dark-700 bg-dark-900/70 p-6 lg:block">
      <div className="rounded-2xl border border-dark-700 bg-dark-800/80 p-4 shadow-lg shadow-primary-500/10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-400">Operations</p>
        <div className="mt-4 space-y-2">
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}
