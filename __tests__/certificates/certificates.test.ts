/**
 * Certificate emission tests (integration)
 * - Create certificate with hash + serial generation
 * - Duplicate certificate detection
 * - Certificate revocation
 * - Integrity hash validation
 */

import {
  prismaMock,
  mockSession,
  requirePermissionMock,
  auditSuccessMock,
  buildStudent,
  buildCertificate,
  buildTenant,
} from "../helpers/setup";

/* ══════════════════════════════════
   POST /api/certificates - emission 
   ══════════════════════════════════ */

describe("POST /api/certificates", () => {
  let POST: (req: Request) => Promise<{ json(): Promise<unknown>; status: number }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    requirePermissionMock.mockResolvedValue(mockSession);
    ({ POST } = await import("@/app/api/certificates/route"));
  });

  it("creates a certificate with serial number and hash", async () => {
    const student = buildStudent();
    const tenant = buildTenant();

    prismaMock.student.findFirst.mockResolvedValue(student);
    prismaMock.certificate.findFirst.mockResolvedValue(null); // no duplicate
    prismaMock.certificate.count.mockResolvedValue(0);
    prismaMock.certificate.create.mockResolvedValue({
      ...buildCertificate(),
      student,
      tenant,
    });

    const req = new Request("http://localhost/api/certificates", {
      method: "POST",
      body: JSON.stringify({
        studentId: "student-1",
        title: "Ingeniería de Sistemas",
        degree: "Ingeniero",
      }),
    });

    const res = await POST(req);
    const body = (await res.json()) as { ok: boolean; data: Record<string, unknown> };

    expect(res.status).toBe(201);
    expect(body.ok).toBe(true);

    // Verify prisma.certificate.create was called
    expect(prismaMock.certificate.create).toHaveBeenCalledTimes(1);
    const createCall = prismaMock.certificate.create.mock.calls[0][0];
    expect(createCall.data.tenantId).toBe("tenant-1");
    expect(createCall.data.serialNumber).toMatch(/^RK-\d{4}-\d{6}$/);
    expect(createCall.data.publicCode).toBeTruthy();
    expect(createCall.data.qrPayloadHash).toBeTruthy();
    expect(createCall.data.status).toBe("ISSUED");
  });

  it("audits certificate issuance", async () => {
    prismaMock.student.findFirst.mockResolvedValue(buildStudent());
    prismaMock.certificate.findFirst.mockResolvedValue(null);
    prismaMock.certificate.count.mockResolvedValue(5);
    prismaMock.certificate.create.mockResolvedValue({
      ...buildCertificate({ id: "cert-new" }),
      student: buildStudent(),
      tenant: buildTenant(),
    });

    const req = new Request("http://localhost/api/certificates", {
      method: "POST",
      body: JSON.stringify({
        studentId: "student-1",
        title: "Derecho",
        degree: "Abogado",
      }),
    });

    await POST(req);

    expect(auditSuccessMock).toHaveBeenCalledWith(
      "tenant-1",
      "user-1",
      "ISSUE_CERTIFICATE",
      "Certificate",
      "cert-new",
      expect.objectContaining({ student: "EST-001" }),
    );
  });

  it("rejects invalid body (missing title)", async () => {
    const req = new Request("http://localhost/api/certificates", {
      method: "POST",
      body: JSON.stringify({ studentId: "s1" }),
    });

    const res = await POST(req);
    const body = (await res.json()) as { ok: boolean; code: string };

    expect(body.ok).toBe(false);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 when student not found", async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/certificates", {
      method: "POST",
      body: JSON.stringify({
        studentId: "nonexistent",
        title: "Test",
        degree: "Test",
      }),
    });

    const res = await POST(req);
    const body = (await res.json()) as { ok: boolean; code: string };

    expect(body.ok).toBe(false);
    expect(body.code).toBe("NOT_FOUND");
  });
});

/* ══════════════════════════════════
   Caso clave: Certificado duplicado
   ══════════════════════════════════ */

describe("Caso clave: certificado duplicado", () => {
  let POST: (req: Request) => Promise<{ json(): Promise<unknown>; status: number }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    requirePermissionMock.mockResolvedValue(mockSession);
    ({ POST } = await import("@/app/api/certificates/route"));
  });

  it("rejects duplicate certificate for same student + title", async () => {
    const student = buildStudent();
    prismaMock.student.findFirst.mockResolvedValue(student);
    prismaMock.certificate.findFirst.mockResolvedValue(buildCertificate()); // existing!

    const req = new Request("http://localhost/api/certificates", {
      method: "POST",
      body: JSON.stringify({
        studentId: "student-1",
        title: "Ingeniería de Sistemas",
        degree: "Ingeniero",
      }),
    });

    const res = await POST(req);
    const body = (await res.json()) as { ok: boolean; code: string; message: string };

    expect(body.ok).toBe(false);
    expect(body.code).toBe("CONFLICT");
    expect(body.message).toContain("Ya existe un certificado activo");
  });

  it("allows same title if previous was REVOKED", async () => {
    // findFirst returns null because the query filters status != REVOKED
    prismaMock.student.findFirst.mockResolvedValue(buildStudent());
    prismaMock.certificate.findFirst.mockResolvedValue(null);
    prismaMock.certificate.count.mockResolvedValue(1);
    prismaMock.certificate.create.mockResolvedValue({
      ...buildCertificate({ id: "cert-new" }),
      student: buildStudent(),
      tenant: buildTenant(),
    });

    const req = new Request("http://localhost/api/certificates", {
      method: "POST",
      body: JSON.stringify({
        studentId: "student-1",
        title: "Ingeniería de Sistemas",
        degree: "Ingeniero",
      }),
    });

    const res = await POST(req);
    const body = (await res.json()) as { ok: boolean };

    expect(body.ok).toBe(true);
  });
});

/* ══════════════════════════════════
   POST /api/certificates/[id]/revoke
   ══════════════════════════════════ */

describe("POST /api/certificates/[id]/revoke", () => {
  let POST: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<{ json(): Promise<unknown>; status: number }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    requirePermissionMock.mockResolvedValue(mockSession);
    ({ POST } = await import("@/app/api/certificates/[id]/revoke/route"));
  });

  it("revokes an ISSUED certificate", async () => {
    const cert = buildCertificate({ status: "ISSUED" });
    prismaMock.certificate.findFirst.mockResolvedValue(cert);
    prismaMock.certificate.update.mockResolvedValue({
      ...cert,
      status: "REVOKED",
      revokedAt: new Date(),
      student: buildStudent(),
      tenant: buildTenant(),
    });

    const res = await POST(
      new Request("http://localhost/api/certificates/cert-1/revoke", { method: "POST" }),
      { params: Promise.resolve({ id: "cert-1" }) },
    );
    const body = (await res.json()) as { ok: boolean };

    expect(body.ok).toBe(true);
    expect(prismaMock.certificate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "REVOKED" }),
      }),
    );
  });

  it("rejects revoking an already REVOKED certificate", async () => {
    prismaMock.certificate.findFirst.mockResolvedValue(buildCertificate({ status: "REVOKED" }));

    const res = await POST(
      new Request("http://localhost/api/certificates/cert-1/revoke", { method: "POST" }),
      { params: Promise.resolve({ id: "cert-1" }) },
    );
    const body = (await res.json()) as { ok: boolean; code: string };

    expect(body.ok).toBe(false);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects revoking a DRAFT certificate", async () => {
    prismaMock.certificate.findFirst.mockResolvedValue(buildCertificate({ status: "DRAFT" }));

    const res = await POST(
      new Request("http://localhost/api/certificates/cert-1/revoke", { method: "POST" }),
      { params: Promise.resolve({ id: "cert-1" }) },
    );
    const body = (await res.json()) as { ok: boolean; code: string };

    expect(body.ok).toBe(false);
  });

  it("returns 404 for non-existent certificate", async () => {
    prismaMock.certificate.findFirst.mockResolvedValue(null);

    const res = await POST(
      new Request("http://localhost/api/certificates/cert-x/revoke", { method: "POST" }),
      { params: Promise.resolve({ id: "cert-x" }) },
    );
    const body = (await res.json()) as { ok: boolean; code: string };

    expect(body.ok).toBe(false);
    expect(body.code).toBe("NOT_FOUND");
  });

  it("audits certificate revocation", async () => {
    const cert = buildCertificate({ status: "ISSUED" });
    prismaMock.certificate.findFirst.mockResolvedValue(cert);
    prismaMock.certificate.update.mockResolvedValue({
      ...cert,
      status: "REVOKED",
      student: buildStudent(),
      tenant: buildTenant(),
    });

    await POST(
      new Request("http://localhost/api/certificates/cert-1/revoke", { method: "POST" }),
      { params: Promise.resolve({ id: "cert-1" }) },
    );

    expect(auditSuccessMock).toHaveBeenCalledWith(
      "tenant-1",
      "user-1",
      "REVOKE_CERTIFICATE",
      "Certificate",
      "cert-1",
      expect.objectContaining({ serialNumber: "RK-2025-000001" }),
    );
  });
});

/* ══════════════════════════════════
   Integrity hash validation (unit)
   ══════════════════════════════════ */

describe("Integrity hash generation", () => {
  it("SHA-256 hash of publicCode:serialNumber is deterministic", () => {
    const { createHash } = require("crypto");
    const publicCode = "test-uuid";
    const serialNumber = "RK-2025-000001";

    const hash1 = createHash("sha256").update(`${publicCode}:${serialNumber}`).digest("hex");
    const hash2 = createHash("sha256").update(`${publicCode}:${serialNumber}`).digest("hex");

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
  });

  it("different inputs produce different hashes", () => {
    const { createHash } = require("crypto");

    const hash1 = createHash("sha256").update("code1:serial1").digest("hex");
    const hash2 = createHash("sha256").update("code2:serial2").digest("hex");

    expect(hash1).not.toBe(hash2);
  });
});
