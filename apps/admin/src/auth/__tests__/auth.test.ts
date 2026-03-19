import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "../store";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts unauthenticated", () => {
      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("login", () => {
    it("stores user and token on success", async () => {
      const fakeJwt =
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9." +
        btoa(
          JSON.stringify({
            sub: "user-1",
            email: "admin@hr.dev",
            name: "Admin",
            role: "super_admin",
            org_id: "org-1",
          }),
        ) +
        ".signature";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: fakeJwt,
          user: {
            id: "user-1",
            email: "admin@hr.dev",
            name: "Admin",
            role: "super_admin",
            organization_id: "org-1",
          },
        }),
      });

      await useAuthStore.getState().login("admin@hr.dev", "HrDev2024!");

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe("admin@hr.dev");
      expect(state.user?.role).toBe("super_admin");
      expect(state.accessToken).toBe(fakeJwt);
    });

    it("throws on failed login", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid credentials" }),
      });

      await expect(
        useAuthStore.getState().login("bad@test.com", "wrong"),
      ).rejects.toThrow("Invalid credentials");

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("logout", () => {
    it("clears state and calls logout endpoint", async () => {
      // Set up authenticated state
      useAuthStore.setState({
        accessToken: "token",
        user: {
          id: "u1",
          email: "a@b.com",
          name: "A",
          role: "employee",
          organization_id: "o1",
        },
        isAuthenticated: true,
      });

      mockFetch.mockResolvedValueOnce({ ok: true });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/logout"),
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
    });
  });

  describe("refresh", () => {
    it("updates access token on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "new-token",
          user: {
            id: "u1",
            email: "a@b.com",
            name: "A",
            role: "hr_manager",
            organization_id: "o1",
          },
        }),
      });

      const result = await useAuthStore.getState().refresh();
      expect(result).toBe(true);
      expect(useAuthStore.getState().accessToken).toBe("new-token");
    });

    it("returns false on failure", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

      const result = await useAuthStore.getState().refresh();
      expect(result).toBe(false);
    });

    it("deduplicates concurrent refresh calls", async () => {
      let resolveRefresh: (v: Response) => void;
      mockFetch.mockReturnValue(
        new Promise<Response>((r) => {
          resolveRefresh = r;
        }),
      );

      const p1 = useAuthStore.getState().refresh();
      const p2 = useAuthStore.getState().refresh();

      resolveRefresh!({
        ok: true,
        json: async () => ({
          access_token: "deduped-token",
          user: {
            id: "u1",
            email: "a@b.com",
            name: "A",
            role: "employee",
            organization_id: "o1",
          },
        }),
      } as Response);

      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toBe(true);
      expect(r2).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
