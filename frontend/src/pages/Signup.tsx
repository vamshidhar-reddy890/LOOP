import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export default function Signup() {
  const { signup, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('VIEWER');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await signup({ name, email, password, role });
    } finally {
      setSubmitting(false);
    }
  };

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: 'ADMIN', label: 'Admin', description: 'Full access to all features and settings' },
    { value: 'ANALYST', label: 'Analyst', description: 'Can view and analyze feedback, create reports' },
    { value: 'VIEWER', label: 'Viewer', description: 'Read-only access to dashboards and reports' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-950 px-4 py-10 text-dark-100">
      <div className="w-full max-w-md rounded-2xl border border-dark-700 bg-dark-800/80 p-8 shadow-2xl shadow-primary-500/10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Create your workspace</h1>
          <p className="mt-2 text-sm text-dark-400">Join LOOP with your team and start making sense of feedback.</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Name</label>
            <input className="input-field" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Email</label>
            <input className="input-field" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Password</label>
            <input className="input-field" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Role</label>
            <select className="input-field" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-dark-400">
              {roles.find(r => r.value === role)?.description}
            </p>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button className="btn-primary w-full" disabled={submitting} type="submit">
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-dark-400">
          Already a member?{' '}
          <Link to="/login" className="font-medium text-primary-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}