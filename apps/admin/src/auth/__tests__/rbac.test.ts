import { describe, it, expect } from "vitest";

import { checkPermission, type User } from "../AuthProvider";

function user(role: User["role"], permissions?: string[]): User {
  return {
    id: "u1",
    email: "user@example.com",
    name: "User",
    role,
    organization_id: "org1",
    permissions,
  };
}

describe("checkPermission", () => {
  it("returns false when user is null", () => {
    expect(checkPermission(null, "employees:read")).toBe(false);
  });

  it("returns true for empty permission string", () => {
    expect(checkPermission(user("employee"), "")).toBe(true);
  });

  it("grants all permissions to super_admin and org_admin", () => {
    expect(checkPermission(user("super_admin"), "employees:write")).toBe(true);
    expect(checkPermission(user("org_admin"), "payroll:run")).toBe(true);
    expect(checkPermission(user("super_admin"), "any:custom")).toBe(true);
  });

  it("uses explicit permissions list for other roles", () => {
    expect(checkPermission(user("hr_manager"), "employees:write")).toBe(false);
    expect(
      checkPermission(user("hr_manager", ["employees:write"]), "employees:write"),
    ).toBe(true);
  });

  it("returns false for employee without matching scope", () => {
    expect(checkPermission(user("employee"), "employees:read")).toBe(false);
    expect(
      checkPermission(user("employee", ["employees:read"]), "employees:read"),
    ).toBe(true);
  });
});
