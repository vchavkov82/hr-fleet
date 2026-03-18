import React, { createContext, useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export type Role =
  | 'super_admin'
  | 'org_admin'
  | 'hr_manager'
  | 'payroll_manager'
  | 'department_head'
  | 'manager'
  | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organization_id: string;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  hasPermission: () => false,
});

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const restoreSession = useCallback(async () => {
    try {
      const res = await api.post('/auth/refresh');
      setState({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.post('/auth/refresh');
        setState((prev) => ({
          ...prev,
          user: res.data.user,
          isAuthenticated: true,
        }));
      } catch {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    setState({ user: res.data.user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    }
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!state.user) return false;
      if (!permission) return true;

      if (state.user.role === 'super_admin' || state.user.role === 'org_admin') {
        return true;
      }

      return state.user.permissions?.includes(permission) ?? false;
    },
    [state.user],
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
