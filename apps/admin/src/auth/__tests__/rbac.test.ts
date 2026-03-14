import { describe, it, expect } from "vitest";
import { PERMISSION_MAP, hasPermission } from "../hooks";
import type { Role } from "../store";

const ALL_ROLES: Role[] = [
  "super_admin",
  "org_admin",
  "hr_manager",
  "payroll_manager",
  "department_head",
  "manager",
  "employee",
];

describe("PERMISSION_MAP", () => {
  it("defines all 11 permissions", () => {
    expect(Object.keys(PERMISSION_MAP)).toHaveLength(11);
  });

  it("includes expected permission keys", () => {
    const expected = [
      "employees:read",
      "employees:write",
      "payroll:read",
      "payroll:run",
      "payroll:approve",
      "leave:approve",
      "contracts:write",
      "reports:read",
      "users:manage",
      "audit:read",
      "settings:write",
    ];
    expect(Object.keys(PERMISSION_MAP).sort()).toEqual(expected.sort());
  });
});

describe("hasPermission", () => {
  describe("employees:write", () => {
    it("returns true for super_admin, org_admin, hr_manager", () => {
      expect(hasPermission("super_admin", "employees:write")).toBe(true);
      expect(hasPermission("org_admin", "employees:write")).toBe(true);
      expect(hasPermission("hr_manager", "employees:write")).toBe(true);
    });

    it("returns false for employee", () => {
      expect(hasPermission("employee", "employees:write")).toBe(false);
    });
  });

  describe("payroll:run", () => {
    it("returns true for super_admin, org_admin, payroll_manager", () => {
      expect(hasPermission("super_admin", "payroll:run")).toBe(true);
      expect(hasPermission("org_admin", "payroll:run")).toBe(true);
      expect(hasPermission("payroll_manager", "payroll:run")).toBe(true);
    });

    it("returns false for hr_manager", () => {
      expect(hasPermission("hr_manager", "payroll:run")).toBe(false);
    });
  });

  describe("settings:write", () => {
    it("returns true only for super_admin", () => {
      expect(hasPermission("super_admin", "settings:write")).toBe(true);
    });

    it("returns false for all other roles", () => {
      const others = ALL_ROLES.filter((r) => r !== "super_admin");
      for (const role of others) {
        expect(hasPermission(role, "settings:write")).toBe(false);
      }
    });
  });

  describe("employees:read", () => {
    it("is granted to all roles except employee", () => {
      const granted = ALL_ROLES.filter((r) => r !== "employee");
      for (const role of granted) {
        expect(hasPermission(role, "employees:read")).toBe(true);
      }
      expect(hasPermission("employee", "employees:read")).toBe(false);
    });
  });

  describe("audit:read", () => {
    it("is granted only to super_admin and org_admin", () => {
      expect(hasPermission("super_admin", "audit:read")).toBe(true);
      expect(hasPermission("org_admin", "audit:read")).toBe(true);
      expect(hasPermission("hr_manager", "audit:read")).toBe(false);
    });
  });

  describe("unknown permission", () => {
    it("returns false for any role", () => {
      expect(hasPermission("super_admin", "nonexistent:perm")).toBe(false);
    });
  });
});
