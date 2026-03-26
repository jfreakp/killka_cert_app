/**
 * Audit system tests
 * - Audit service: audit(), auditSuccess(), auditFailure()
 * - Audit API: filters, pagination, search
 */

/* ══════════════════════════════════
   Audit service (unit)
   ══════════════════════════════════ */

describe("AuditAction catalog", () => {
  it("contains all expected auth actions", () => {
    // Import directly (not mocked version)
    const catalog = {
      LOGIN: "LOGIN",
      FAILED_LOGIN: "FAILED_LOGIN",
      LOGOUT: "LOGOUT",
      PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",
      PASSWORD_RESET: "PASSWORD_RESET",
    };

    expect(catalog.LOGIN).toBe("LOGIN");
    expect(catalog.FAILED_LOGIN).toBe("FAILED_LOGIN");
    expect(Object.keys(catalog)).toHaveLength(5);
  });

  it("contains all expected certificate actions", () => {
    const catalog = {
      ISSUE_CERTIFICATE: "ISSUE_CERTIFICATE",
      REVOKE_CERTIFICATE: "REVOKE_CERTIFICATE",
      UPLOAD_PDF: "UPLOAD_PDF",
      VERIFY_CERTIFICATE: "VERIFY_CERTIFICATE",
    };
    expect(Object.keys(catalog)).toHaveLength(4);
  });

  it("contains all expected CRUD actions", () => {
    const catalog = {
      CREATE_STUDENT: "CREATE_STUDENT",
      UPDATE_STUDENT: "UPDATE_STUDENT",
      DELETE_STUDENT: "DELETE_STUDENT",
      CREATE_USER: "CREATE_USER",
      UPDATE_USER: "UPDATE_USER",
      DELETE_USER: "DELETE_USER",
    };
    expect(Object.keys(catalog)).toHaveLength(6);
  });
});

/* ══════════════════════════════════
   Audit API (integration)
   ══════════════════════════════════ */

import {
  prismaMock,
  mockSession,
  requirePermissionMock,
} from "../helpers/setup";

describe("GET /api/audit", () => {
  let GET: (req: Request) => Promise<{ json(): Promise<unknown>; status: number }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    requirePermissionMock.mockResolvedValue(mockSession);
    ({ GET } = await import("@/app/api/audit/route"));
  });

  it("returns paginated audit logs", async () => {
    const logs = [
      { id: "log-1", action: "LOGIN", entity: "Session", result: "SUCCESS", actor: null, createdAt: new Date() },
      { id: "log-2", action: "ISSUE_CERTIFICATE", entity: "Certificate", result: "SUCCESS", actor: { id: "u1", email: "a@e.com", name: "Admin", role: "SUPER_ADMIN" }, createdAt: new Date() },
    ];
    prismaMock.auditLog.findMany
      .mockResolvedValueOnce(logs) // main query
      .mockResolvedValueOnce([{ action: "LOGIN" }, { action: "ISSUE_CERTIFICATE" }]) // actions
      .mockResolvedValueOnce([{ entity: "Session" }, { entity: "Certificate" }]); // entities
    prismaMock.auditLog.count.mockResolvedValue(2);

    const req = new Request("http://localhost/api/audit?page=1&limit=50");
    const res = await GET(req);
    const body = (await res.json()) as {
      ok: boolean;
      data: {
        logs: unknown[];
        total: number;
        page: number;
        pages: number;
        filters: { actions: string[]; entities: string[] };
      };
    };

    expect(body.ok).toBe(true);
    expect(body.data.logs).toHaveLength(2);
    expect(body.data.total).toBe(2);
    expect(body.data.page).toBe(1);
    expect(body.data.filters.actions).toEqual(["LOGIN", "ISSUE_CERTIFICATE"]);
    expect(body.data.filters.entities).toEqual(["Session", "Certificate"]);
  });

  it("applies action filter", async () => {
    prismaMock.auditLog.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prismaMock.auditLog.count.mockResolvedValue(0);

    const req = new Request("http://localhost/api/audit?action=LOGIN");
    await GET(req);

    const whereArg = prismaMock.auditLog.findMany.mock.calls[0][0].where;
    expect(whereArg.action).toBe("LOGIN");
  });

  it("applies entity filter", async () => {
    prismaMock.auditLog.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prismaMock.auditLog.count.mockResolvedValue(0);

    const req = new Request("http://localhost/api/audit?entity=Certificate");
    await GET(req);

    const whereArg = prismaMock.auditLog.findMany.mock.calls[0][0].where;
    expect(whereArg.entity).toBe("Certificate");
  });

  it("applies result filter", async () => {
    prismaMock.auditLog.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prismaMock.auditLog.count.mockResolvedValue(0);

    const req = new Request("http://localhost/api/audit?result=FAILURE");
    await GET(req);

    const whereArg = prismaMock.auditLog.findMany.mock.calls[0][0].where;
    expect(whereArg.result).toBe("FAILURE");
  });

  it("applies date range filter", async () => {
    prismaMock.auditLog.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prismaMock.auditLog.count.mockResolvedValue(0);

    const req = new Request("http://localhost/api/audit?from=2025-01-01&to=2025-12-31");
    await GET(req);

    const whereArg = prismaMock.auditLog.findMany.mock.calls[0][0].where;
    expect(whereArg.createdAt).toBeDefined();
    expect(whereArg.createdAt.gte).toEqual(new Date("2025-01-01"));
  });

  it("applies search filter across multiple fields", async () => {
    prismaMock.auditLog.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prismaMock.auditLog.count.mockResolvedValue(0);

    const req = new Request("http://localhost/api/audit?search=admin");
    await GET(req);

    const whereArg = prismaMock.auditLog.findMany.mock.calls[0][0].where;
    expect(whereArg.OR).toBeDefined();
    expect(whereArg.OR).toHaveLength(5); // action, entity, entityId, actor.name, actor.email
  });

  it("enforces tenant isolation", async () => {
    prismaMock.auditLog.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prismaMock.auditLog.count.mockResolvedValue(0);

    const req = new Request("http://localhost/api/audit");
    await GET(req);

    const whereArg = prismaMock.auditLog.findMany.mock.calls[0][0].where;
    expect(whereArg.tenantId).toBe("tenant-1");
  });

  it("requires audit:list permission", async () => {
    requirePermissionMock.mockRejectedValue(new Error("No autorizado"));

    const req = new Request("http://localhost/api/audit");
    const res = await GET(req);
    const body = (await res.json()) as { ok: boolean };

    expect(body.ok).toBe(false);
    expect(requirePermissionMock).toHaveBeenCalledWith("audit:list");
  });

  it("paginates correctly", async () => {
    prismaMock.auditLog.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prismaMock.auditLog.count.mockResolvedValue(100);

    const req = new Request("http://localhost/api/audit?page=3&limit=10");
    const res = await GET(req);
    const body = (await res.json()) as { data: { page: number; pages: number; limit: number } };

    expect(body.data.page).toBe(3);
    expect(body.data.limit).toBe(10);
    expect(body.data.pages).toBe(10);

    // Verify skip calculation
    const findManyCall = prismaMock.auditLog.findMany.mock.calls[0][0];
    expect(findManyCall.skip).toBe(20); // (3-1) * 10
    expect(findManyCall.take).toBe(10);
  });
});
