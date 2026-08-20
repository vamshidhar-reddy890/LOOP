import { Mail, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-400">Profile</p>
        <h1 className="mt-2 text-3xl font-semibold text-dark-100">Your account</h1>
      </div>
      <div className="card flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-primary-600/20 p-4 text-primary-400">
            <UserCircle2 size={42} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-dark-100">{user?.name}</h2>
            <p className="mt-1 text-sm text-dark-400">Role: {user?.role}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm text-dark-400">
          <div className="flex items-center gap-2">
            <Mail size={16} />
            {user?.email}
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            Secure account with JWT-backed sessions
          </div>
        </div>
      </div>
    </div>
  );
}
