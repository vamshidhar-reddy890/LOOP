import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { email: 'admin@loop.com', label: 'Admin', role: 'ADMIN' },
  { email: 'analyst@loop.com', label: 'Analyst', role: 'ANALYST' },
  { email: 'viewer@loop.com', label: 'Viewer', role: 'VIEWER' },
];

export default function Login() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('admin@loop.com');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-950 px-4 py-10 text-dark-100">
      <div className="w-full max-w-md rounded-2xl border border-dark-700 bg-dark-800/80 p-8 shadow-2xl shadow-primary-500/10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-dark-400">Sign in to keep your feedback loop moving.</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Email</label>
            <input className="input-field" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Password</label>
            <input className="input-field" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button className="btn-primary w-full" disabled={submitting} type="submit">
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 space-y-3">
          <p className="text-xs text-center text-dark-400">Quick login with demo accounts:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {demoAccounts.map((demo) => (
              <button
                key={demo.email}
                type="button"
                className="btn-secondary text-xs py-1.5 px-3"
                onClick={() => fillDemo(demo.email)}
              >
                {demo.label} ({demo.role})
              </button>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-dark-400">
          New to LOOP?{' '}
          <Link to="/signup" className="font-medium text-primary-400">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}