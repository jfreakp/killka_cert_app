// ─── Role type (matches Prisma UserRole enum — standalone for edge/client compat) ───

export type Role = "SUPER_ADMIN" | "UNIVERSITY" | "OPERATOR" | "VERIFIER";

// ─── Permission definitions ───

export const P = {
  // Dashboard
  "dashboard:view": "dashboard:view",

  // Students
  "students:list": "students:list",
  "students:create": "students:create",
  "students:edit": "students:edit",
  "students:delete": "students:delete",

  // Certificates
  "certificates:list": "certificates:list",
  "certificates:create": "certificates:create",
  "certificates:revoke": "certificates:revoke",
  "certificates:verify": "certificates:verify",

  // Users
  "users:list": "users:list",
  "users:create": "users:create",
  "users:edit": "users:edit",
  "users:delete": "users:delete",

  // Audit
  "audit:list": "audit:list",

  // Settings
  "settings:view": "settings:view",
  "settings:edit": "settings:edit",
} as const;

export type Permission = (typeof P)[keyof typeof P];

// ─── Role → Permission matrix ───

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: Object.values(P),

  UNIVERSITY: [
    P["dashboard:view"],
    P["students:list"],
    P["students:create"],
    P["students:edit"],
    P["students:delete"],
    P["certificates:list"],
    P["certificates:create"],
    P["certificates:revoke"],
    P["certificates:verify"],
    P["users:list"],
    P["users:create"],
    P["users:edit"],
    P["audit:list"],
    P["settings:view"],
  ],

  OPERATOR: [
    P["dashboard:view"],
    P["students:list"],
    P["students:create"],
    P["students:edit"],
    P["certificates:list"],
    P["certificates:create"],
    P["certificates:verify"],
  ],

  VERIFIER: [
    P["dashboard:view"],
    P["students:list"],
    P["certificates:list"],
    P["certificates:verify"],
  ],
};

// ─── Helpers ───

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function getPermissions(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// ─── Route → Required permission (for proxy, most-specific first) ───

export const ROUTE_PERMISSIONS: [string, Permission][] = [
  ["/dashboard/certificates/new", P["certificates:create"]],
  ["/dashboard/certificates", P["certificates:list"]],
  ["/dashboard/students", P["students:list"]],
  ["/dashboard/users", P["users:list"]],
  ["/dashboard/audit", P["audit:list"]],
  ["/dashboard/settings", P["settings:view"]],
];

// ─── Role display labels ───

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Superadmin",
  UNIVERSITY: "Universidad",
  OPERATOR: "Operador",
  VERIFIER: "Verificador",
};
