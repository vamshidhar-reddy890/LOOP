import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth';
import { AuthResponse, AuthState, LoginRequest, SignupRequest, User } from '../types';

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await authService.login(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await authService.signup(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
    window.location.href = '/login';
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to refresh profile');
      throw err;
    }
  };

  const updateUser = (nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, error, login, signup, logout, refreshProfile, updateUser }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
