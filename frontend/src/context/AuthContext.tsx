import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';

interface AuthUser {
  token: string;
  role: string;
  id?: number;
  name?: string;
  email?: string;
  constituency?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  ready: boolean;
  login: (token: string, role: string) => void;
  logout: () => void;
  updateRole: (role: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const fetchProfile = async (token: string, role: string) => {
    try {
      const res = await api.get('/auth/me');
      setUser({ token, role, ...res.data });
    } catch {
      setUser({ token, role });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      fetchProfile(token, role).finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  const login = (token: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setUser({ token, role }); // set immediately so ProtectedRoute lets the navigation through
    fetchProfile(token, role); // enrich with name/email/constituency asynchronously
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  const updateRole = (role: string) => {
    localStorage.setItem('role', role);
    setUser(prev => prev ? { ...prev, role } : prev);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) await fetchProfile(token, role);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, updateRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
