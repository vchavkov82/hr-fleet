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
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function decodeJWTPayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

function userFromToken(accessToken: string): User {
  const claims = decodeJWTPayload(accessToken);
  return {
    id: claims.sub as string,
    email: claims.email as string,
    name: (claims.email as string).split('@')[0],
    role: claims.role as Role,
    organization_id: String(claims.company_id ?? ''),
  };
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    try {
      const res = await api.post('/auth/refresh', { refresh_token: refreshToken });
      storeTokens(res.data.access_token, res.data.refresh_token);
      const user = userFromToken(res.data.access_token);
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      clearTokens();
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const claims = decodeJWTPayload(token);
        const exp = (claims.exp as number) * 1000;
        if (exp > Date.now()) {
          setState({ user: userFromToken(token), isAuthenticated: true, isLoading: false });
          return;
        }
      } catch {
        // token invalid, try refresh
      }
    }
    refreshSession().then((ok) => {
      if (!ok) setState({ user: null, isAuthenticated: false, isLoading: false });
    });
  }, [refreshSession]);

  // Refresh token 2 minutes before expiry
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(async () => {
      const ok = await refreshSession();
      if (!ok) setState({ user: null, isAuthenticated: false, isLoading: false });
    }, 13 * 60 * 1000); // 13 min (token lasts 15)

    return () => clearInterval(interval);
  }, [state.isAuthenticated, refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    storeTokens(res.data.access_token, res.data.refresh_token);
    const user = userFromToken(res.data.access_token);
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    clearTokens();
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
