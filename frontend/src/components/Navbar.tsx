import { LogOut, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-dark-700 bg-dark-900/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 text-lg font-semibold text-dark-100">
          <div className="rounded-xl bg-primary-600/20 p-2 text-primary-400">
            <MessageCircle size={18} />
          </div>
          LOOP
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden text-sm text-dark-400 md:block">
            Signed in as <span className="font-medium text-dark-200">{user?.name}</span>
          </div>
          <button onClick={logout} className="btn-secondary flex items-center gap-2">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
