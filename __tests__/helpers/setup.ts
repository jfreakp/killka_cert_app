/* ── Prisma mock ── */

export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  student: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  certificate: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  auditLog: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
};

jest.mock("@/src/lib/prisma", () => ({
  prisma: prismaMock,
}));

/* ── next/headers mock ── */

const mockHeaders = new Map<string, string>([
  ["x-forwarded-for", "127.0.0.1"],
  ["user-agent", "jest-test-agent"],
]);

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => ({
    get: (key: string) => mockHeaders.get(key) ?? null,
  })),
}));

/* ── next/server mock ── */

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
      _body: body,
    }),
  },
}));

/* ── Audit mock ── */

export const auditMock = jest.fn();
export const auditSuccessMock = jest.fn();
export const auditFailureMock = jest.fn();

jest.mock("@/src/lib/audit", () => ({
  audit: auditMock,
  auditSuccess: auditSuccessMock,
  auditFailure: auditFailureMock,
  AuditAction: {
    LOGIN: "LOGIN",
    FAILED_LOGIN: "FAILED_LOGIN",
    LOGOUT: "LOGOUT",
    PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",
    PASSWORD_RESET: "PASSWORD_RESET",
    ISSUE_CERTIFICATE: "ISSUE_CERTIFICATE",
    REVOKE_CERTIFICATE: "REVOKE_CERTIFICATE",
    UPLOAD_PDF: "UPLOAD_PDF",
    VERIFY_CERTIFICATE: "VERIFY_CERTIFICATE",
    CREATE_STUDENT: "CREATE_STUDENT",
    UPDATE_STUDENT: "UPDATE_STUDENT",
    DELETE_STUDENT: "DELETE_STUDENT",
    CREATE_USER: "CREATE_USER",
    UPDATE_USER: "UPDATE_USER",
    DELETE_USER: "DELETE_USER",
  },
  AuditEntity: {
    User: "User",
    Certificate: "Certificate",
    Student: "Student",
    Session: "Session",
  },
}));

/* ── Session/Guards mock ── */

export const mockSession = {
  user: {
    id: "user-1",
    email: "admin@test.edu",
    name: "Test Admin",
    role: "SUPER_ADMIN" as const,
    tenantId: "tenant-1",
  },
};

export const requireSessionMock = jest.fn();
export const requirePermissionMock = jest.fn();
export const requireRoleMock = jest.fn();

jest.mock("@/src/shared/auth/guards", () => ({
  requireSession: (...args: unknown[]) => requireSessionMock(...args),
  requirePermission: (...args: unknown[]) => requirePermissionMock(...args),
  requireRole: (...args: unknown[]) => requireRoleMock(...args),
}));

/* ── Test data factories ── */

export function buildUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "admin@test.edu",
    name: "Test Admin",
    passwordHash: "$2a$10$hashedpassword",
    role: "SUPER_ADMIN",
    tenantId: "tenant-1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function buildStudent(overrides: Record<string, unknown> = {}) {
  return {
    id: "student-1",
    tenantId: "tenant-1",
    studentCode: "EST-001",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@test.edu",
    career: "Ingeniería",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function buildCertificate(overrides: Record<string, unknown> = {}) {
  return {
    id: "cert-1",
    tenantId: "tenant-1",
    studentId: "student-1",
    serialNumber: "RK-2025-000001",
    publicCode: "abc-123-def",
    title: "Ingeniería de Sistemas",
    status: "ISSUED",
    issuedAt: new Date("2025-06-15"),
    revokedAt: null,
    pdfUrl: null,
    qrPayloadHash: "somehash",
    metadata: { degree: "Ingeniero" },
    createdAt: new Date("2025-06-15"),
    updatedAt: new Date("2025-06-15"),
    ...overrides,
  };
}

export function buildTenant(overrides: Record<string, unknown> = {}) {
  return {
    id: "tenant-1",
    name: "Universidad de Prueba",
    slug: "univ-prueba",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}
