import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-dark-950 px-6 text-dark-100">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-dark-800 p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">Access denied</p>
            <h1 className="mt-4 text-2xl font-semibold text-dark-100">This page is restricted for your role.</h1>
            <p className="mt-2 text-sm text-dark-400">
              Signed in as <span className="font-medium text-dark-200">{user.role}</span>. Please use an account with the required access level.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
