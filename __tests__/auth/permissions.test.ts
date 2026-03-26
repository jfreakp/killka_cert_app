/**
 * RBAC Permission tests
 * - Permission matrix exhaustive validation
 * - hasPermission / hasAnyPermission / getPermissions
 * - Guard functions: requireSession, requireRole, requirePermission
 */

import {
  hasPermission,
  hasAnyPermission,
  getPermissions,
  P,
  type Role,
  type Permission,
} from "@/src/shared/auth/permissions";

/* ══════════════════════════════════
   Permission matrix
   ══════════════════════════════════ */

describe("hasPermission", () => {
  /* SUPER_ADMIN has all permissions */
  it("SUPER_ADMIN has every permission", () => {
    const allPerms = Object.values(P);
    for (const perm of allPerms) {
      expect(hasPermission("SUPER_ADMIN", perm)).toBe(true);
    }
  });

  /* VERIFIER is read-only + verify */
  it("VERIFIER can view dashboard", () => {
    expect(hasPermission("VERIFIER", "dashboard:view")).toBe(true);
  });

  it("VERIFIER can list certificates", () => {
    expect(hasPermission("VERIFIER", "certificates:list")).toBe(true);
  });

  it("VERIFIER can verify certificates", () => {
    expect(hasPermission("VERIFIER", "certificates:verify")).toBe(true);
  });

  it("VERIFIER cannot create certificates", () => {
    expect(hasPermission("VERIFIER", "certificates:create")).toBe(false);
  });

  it("VERIFIER cannot revoke certificates", () => {
    expect(hasPermission("VERIFIER", "certificates:revoke")).toBe(false);
  });

  it("VERIFIER cannot manage users", () => {
    expect(hasPermission("VERIFIER", "users:list")).toBe(false);
    expect(hasPermission("VERIFIER", "users:create")).toBe(false);
  });

  it("VERIFIER cannot access audit", () => {
    expect(hasPermission("VERIFIER", "audit:list")).toBe(false);
  });

  it("VERIFIER cannot access settings", () => {
    expect(hasPermission("VERIFIER", "settings:view")).toBe(false);
    expect(hasPermission("VERIFIER", "settings:edit")).toBe(false);
  });

  /* OPERATOR can create but not revoke or manage users */
  it("OPERATOR can create students", () => {
    expect(hasPermission("OPERATOR", "students:create")).toBe(true);
  });

  it("OPERATOR can create certificates", () => {
    expect(hasPermission("OPERATOR", "certificates:create")).toBe(true);
  });

  it("OPERATOR cannot revoke certificates", () => {
    expect(hasPermission("OPERATOR", "certificates:revoke")).toBe(false);
  });

  it("OPERATOR cannot delete students", () => {
    expect(hasPermission("OPERATOR", "students:delete")).toBe(false);
  });

  it("OPERATOR cannot manage users", () => {
    expect(hasPermission("OPERATOR", "users:list")).toBe(false);
  });

  it("OPERATOR cannot access audit", () => {
    expect(hasPermission("OPERATOR", "audit:list")).toBe(false);
  });

  /* UNIVERSITY has broad access but not settings:edit or users:delete */
  it("UNIVERSITY can revoke certificates", () => {
    expect(hasPermission("UNIVERSITY", "certificates:revoke")).toBe(true);
  });

  it("UNIVERSITY can manage users (list, create, edit)", () => {
    expect(hasPermission("UNIVERSITY", "users:list")).toBe(true);
    expect(hasPermission("UNIVERSITY", "users:create")).toBe(true);
    expect(hasPermission("UNIVERSITY", "users:edit")).toBe(true);
  });

  it("UNIVERSITY cannot delete users", () => {
    expect(hasPermission("UNIVERSITY", "users:delete")).toBe(false);
  });

  it("UNIVERSITY can access audit logs", () => {
    expect(hasPermission("UNIVERSITY", "audit:list")).toBe(true);
  });

  it("UNIVERSITY can view settings but not edit", () => {
    expect(hasPermission("UNIVERSITY", "settings:view")).toBe(true);
    expect(hasPermission("UNIVERSITY", "settings:edit")).toBe(false);
  });
});

/* ══════════════════════════════════
   hasAnyPermission
   ══════════════════════════════════ */

describe("hasAnyPermission", () => {
  it("returns true if role has at least one of the given permissions", () => {
    expect(hasAnyPermission("VERIFIER", ["certificates:create", "certificates:list"])).toBe(true);
  });

  it("returns false if role has none of the given permissions", () => {
    expect(hasAnyPermission("VERIFIER", ["users:create", "audit:list"])).toBe(false);
  });
});

/* ══════════════════════════════════
   getPermissions
   ══════════════════════════════════ */

describe("getPermissions", () => {
  it("returns all permissions for SUPER_ADMIN", () => {
    const perms = getPermissions("SUPER_ADMIN");
    expect(perms.length).toBe(Object.keys(P).length);
  });

  it("returns limited permissions for VERIFIER", () => {
    const perms = getPermissions("VERIFIER");
    expect(perms.length).toBeLessThan(Object.keys(P).length);
    expect(perms).toContain("dashboard:view");
    expect(perms).toContain("certificates:verify");
    expect(perms).not.toContain("certificates:create");
  });

  it("returns empty array for unknown role", () => {
    const perms = getPermissions("UNKNOWN" as Role);
    expect(perms).toEqual([]);
  });
});

/* ══════════════════════════════════
   Guard functions (integration)
   ══════════════════════════════════ */

describe("guards (integration)", () => {
  // We mock getServerSession to test the guard logic
  const mockGetServerSession = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.doMock("next-auth", () => ({
      getServerSession: mockGetServerSession,
    }));
    jest.doMock("@/src/shared/auth/session", () => ({
      authOptions: {},
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requireSession throws UnauthorizedError when no session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const { requireSession } = await import("@/src/shared/auth/guards");
    await expect(requireSession()).rejects.toThrow("No autenticado");
  });

  it("requireSession returns session when authenticated", async () => {
    const session = { user: { id: "u1", role: "OPERATOR", tenantId: "t1" } };
    mockGetServerSession.mockResolvedValue(session);
    const { requireSession } = await import("@/src/shared/auth/guards");
    const result = await requireSession();
    expect(result.user.id).toBe("u1");
  });

  it("requireRole throws ForbiddenError for wrong role", async () => {
    const session = { user: { id: "u1", role: "VERIFIER", tenantId: "t1" } };
    mockGetServerSession.mockResolvedValue(session);
    const { requireRole } = await import("@/src/shared/auth/guards");
    await expect(requireRole("SUPER_ADMIN")).rejects.toThrow("No autorizado");
  });

  it("requireRole passes for correct role", async () => {
    const session = { user: { id: "u1", role: "OPERATOR", tenantId: "t1" } };
    mockGetServerSession.mockResolvedValue(session);
    const { requireRole } = await import("@/src/shared/auth/guards");
    const result = await requireRole("OPERATOR");
    expect(result.user.role).toBe("OPERATOR");
  });

  it("requirePermission throws ForbiddenError when user lacks permission", async () => {
    const session = { user: { id: "u1", role: "VERIFIER", tenantId: "t1" } };
    mockGetServerSession.mockResolvedValue(session);
    const { requirePermission } = await import("@/src/shared/auth/guards");
    await expect(requirePermission("certificates:create")).rejects.toThrow("No autorizado");
  });

  it("requirePermission passes when user has permission", async () => {
    const session = { user: { id: "u1", role: "OPERATOR", tenantId: "t1" } };
    mockGetServerSession.mockResolvedValue(session);
    const { requirePermission } = await import("@/src/shared/auth/guards");
    const result = await requirePermission("certificates:create");
    expect(result.user.id).toBe("u1");
  });
});

/* ══════════════════════════════════
   Caso clave: Usuario sin permisos
   ══════════════════════════════════ */

describe("Caso clave: usuario sin permisos intenta acción restringida", () => {
  it("VERIFIER trying to create certificate is denied by permission check", () => {
    expect(hasPermission("VERIFIER", "certificates:create")).toBe(false);
  });

  it("VERIFIER trying to revoke certificate is denied", () => {
    expect(hasPermission("VERIFIER", "certificates:revoke")).toBe(false);
  });

  it("OPERATOR trying to delete user is denied", () => {
    expect(hasPermission("OPERATOR", "users:delete")).toBe(false);
  });

  it("OPERATOR trying to access audit is denied", () => {
    expect(hasPermission("OPERATOR", "audit:list")).toBe(false);
  });
});
