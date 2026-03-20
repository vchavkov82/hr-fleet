import { describe, it, expect } from "vitest";

import { userFromToken } from "../AuthProvider";

function fakeJWT(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe("userFromToken", () => {
  it("maps JWT claims to User", () => {
    const token = fakeJWT({
      sub: "user-1",
      email: "admin@hr.dev",
      role: "super_admin",
      company_id: "co-99",
    });
    const u = userFromToken(token);
    expect(u.id).toBe("user-1");
    expect(u.email).toBe("admin@hr.dev");
    expect(u.role).toBe("super_admin");
    expect(u.organization_id).toBe("co-99");
    expect(u.name).toBe("admin");
  });
});
