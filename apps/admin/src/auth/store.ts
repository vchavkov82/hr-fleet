import { create } from "zustand";

export type Role =
  | "super_admin"
  | "org_admin"
  | "hr_manager"
  | "payroll_manager"
  | "department_head"
  | "manager"
  | "employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organization_id: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  reset: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

let refreshPromise: Promise<boolean> | null = null;

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(body.error ?? "Login failed");
    }

    const data = await res.json();
    set({
      accessToken: data.access_token,
      user: data.user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    const token = get().accessToken;
    set({ accessToken: null, user: null, isAuthenticated: false });

    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // Ignore logout endpoint errors
    }
  },

  refresh: () => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          set({ accessToken: null, user: null, isAuthenticated: false });
          return false;
        }

        const data = await res.json();
        set({
          accessToken: data.access_token,
          user: data.user,
          isAuthenticated: true,
        });
        return true;
      } catch {
        set({ accessToken: null, user: null, isAuthenticated: false });
        return false;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  reset: () => {
    set({ accessToken: null, user: null, isAuthenticated: false });
    refreshPromise = null;
  },
}));
