import { useState } from 'react';
import { Lock, Settings2, Sparkles } from 'lucide-react';
import { authService } from '../services/auth';
import { workspaceService } from '../services/workspace';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [workspaceName, setWorkspaceName] = useState('Northstar Workspace');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const updatedUser = await authService.updateProfile({ name, email: user.email, role: user.role, createdAt: user.createdAt });
    updateUser(updatedUser);
    setMessage('Profile updated.');
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await authService.changePassword(oldPassword, newPassword);
    setMessage('Password updated.');
    setOldPassword('');
    setNewPassword('');
  };

  const handleWorkspaceCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await workspaceService.create({ name: workspaceName, description: 'New workspace created from the settings panel.' });
    setMessage('Workspace created.');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-400">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-dark-100">Tune your workspace</h1>
      </div>
      {message ? <p className="text-sm text-primary-300">{message}</p> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <form className="card space-y-4" onSubmit={handleProfileUpdate}>
          <div className="flex items-center gap-2 text-primary-400">
            <Settings2 size={18} />
            <h2 className="text-xl font-semibold text-dark-100">Profile</h2>
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Display name</label>
            <input className="input-field" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <button className="btn-primary" type="submit">Save profile</button>
        </form>

        <form className="card space-y-4" onSubmit={handlePasswordChange}>
          <div className="flex items-center gap-2 text-primary-400">
            <Lock size={18} />
            <h2 className="text-xl font-semibold text-dark-100">Password</h2>
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Current password</label>
            <input className="input-field" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} type="password" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">New password</label>
            <input className="input-field" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" />
          </div>
          <button className="btn-primary" type="submit">Update password</button>
        </form>
      </div>

      <form className="card space-y-4" onSubmit={handleWorkspaceCreate}>
        <div className="flex items-center gap-2 text-primary-400">
          <Sparkles size={18} />
          <h2 className="text-xl font-semibold text-dark-100">Create a new workspace</h2>
        </div>
        <div>
          <label className="mb-2 block text-sm text-dark-300">Workspace name</label>
          <input className="input-field" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} />
        </div>
        <button className="btn-primary" type="submit">Create workspace</button>
      </form>
    </div>
  );
}
