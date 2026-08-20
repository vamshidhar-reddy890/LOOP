import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Feedback from './pages/Feedback';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function AppLayout() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute requiredRole={['ADMIN', 'ANALYST']}><Feedback /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute requiredRole={['ADMIN', 'ANALYST', 'VIEWER']}><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requiredRole="ADMIN"><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute requiredRole={['ADMIN', 'ANALYST', 'VIEWER']}><Profile /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950 text-dark-100">
        <div className="rounded-xl border border-dark-700 bg-dark-800 px-8 py-6 text-center">
          <p className="text-lg font-semibold">Preparing your workspace...</p>
          <p className="mt-2 text-sm text-dark-400">Please wait while we load your app.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
    </Routes>
  );
}
