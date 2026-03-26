/**
 * Public validation / verification tests
 * - Valid certificate verification
 * - NOT_FOUND status
 * - REVOKED status
 * - Caso clave: Hash inválido (integrity compromised)
 * - Audit logging on verification
 */

import {
  prismaMock,
  auditMock,
  buildCertificate,
  buildStudent,
  buildTenant,
} from "../helpers/setup";
import { createHash } from "crypto";

describe("GET /api/verification/[code]", () => {
  let GET: (
    req: Request,
    ctx: { params: Promise<{ code: string }> },
  ) => Promise<{ json(): Promise<unknown>; status: number }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    ({ GET } = await import("@/app/api/verification/[code]/route"));
  });

  function buildCertWithValidHash(overrides: Record<string, unknown> = {}) {
    const publicCode = "valid-uuid-code";
    const serialNumber = "RK-2025-000001";
    const qrPayloadHash = createHash("sha256")
      .update(`${publicCode}:${serialNumber}`)
      .digest("hex");

    return {
      ...buildCertificate({ publicCode, serialNumber, qrPayloadHash }),
      student: buildStudent(),
      tenant: buildTenant(),
      ...overrides,
    };
  }

  /* ── Valid certificate ── */

  it("returns valid=true for ISSUED certificate with correct hash", async () => {
    const cert = buildCertWithValidHash({ status: "ISSUED" });
    prismaMock.certificate.findUnique.mockResolvedValue(cert);

    const res = await GET(
      new Request("http://localhost/api/verification/valid-uuid-code"),
      { params: Promise.resolve({ code: "valid-uuid-code" }) },
    );
    const body = (await res.json()) as {
      ok: boolean;
      data: { valid: boolean; status: string; integrityValid: boolean; studentName: string };
    };

    expect(body.ok).toBe(true);
    expect(body.data.valid).toBe(true);
    expect(body.data.status).toBe("ISSUED");
    expect(body.data.integrityValid).toBe(true);
    expect(body.data.studentName).toBe("Juan Pérez");
  });

  it("returns certificate details in response", async () => {
    const cert = buildCertWithValidHash({ status: "ISSUED" });
    prismaMock.certificate.findUnique.mockResolvedValue(cert);

    const res = await GET(
      new Request("http://localhost/api/verification/valid-uuid-code"),
      { params: Promise.resolve({ code: "valid-uuid-code" }) },
    );
    const body = (await res.json()) as {
      data: {
        university: string;
        title: string;
        serialNumber: string;
        degree: string;
      };
    };

    expect(body.data.university).toBe("Universidad de Prueba");
    expect(body.data.title).toBe("Ingeniería de Sistemas");
    expect(body.data.serialNumber).toBe("RK-2025-000001");
    expect(body.data.degree).toBe("Ingeniero");
  });

  /* ── NOT_FOUND ── */

  it("returns NOT_FOUND for unknown code", async () => {
    prismaMock.certificate.findUnique.mockResolvedValue(null);

    const res = await GET(
      new Request("http://localhost/api/verification/unknown-code"),
      { params: Promise.resolve({ code: "unknown-code" }) },
    );
    const body = (await res.json()) as {
      ok: boolean;
      data: { valid: boolean; status: string };
    };

    expect(body.ok).toBe(true);
    expect(body.data.valid).toBe(false);
    expect(body.data.status).toBe("NOT_FOUND");
  });

  /* ── REVOKED ── */

  it("returns valid=false for REVOKED certificate", async () => {
    const cert = buildCertWithValidHash({
      status: "REVOKED",
      revokedAt: new Date("2025-07-01"),
    });
    prismaMock.certificate.findUnique.mockResolvedValue(cert);

    const res = await GET(
      new Request("http://localhost/api/verification/valid-uuid-code"),
      { params: Promise.resolve({ code: "valid-uuid-code" }) },
    );
    const body = (await res.json()) as {
      ok: boolean;
      data: { valid: boolean; status: string; integrityValid: boolean };
    };

    expect(body.data.valid).toBe(false);
    expect(body.data.status).toBe("REVOKED");
    // Hash is still valid even though cert is revoked
    expect(body.data.integrityValid).toBe(true);
  });

  /* ── Caso clave: Hash inválido ── */

  it("returns integrityValid=false when hash has been tampered", async () => {
    const cert = buildCertWithValidHash({ status: "ISSUED" });
    // Tamper the hash
    cert.qrPayloadHash = "tampered_invalid_hash_value_here";
    prismaMock.certificate.findUnique.mockResolvedValue(cert);

    const res = await GET(
      new Request("http://localhost/api/verification/valid-uuid-code"),
      { params: Promise.resolve({ code: "valid-uuid-code" }) },
    );
    const body = (await res.json()) as {
      ok: boolean;
      data: { valid: boolean; integrityValid: boolean };
    };

    expect(body.data.valid).toBe(false); // invalid because integrity failed
    expect(body.data.integrityValid).toBe(false);
  });

  it("status=ISSUED but hash invalid → valid=false", async () => {
    const publicCode = "some-code";
    const serialNumber = "RK-2025-000002";
    const cert = {
      ...buildCertificate({
        publicCode,
        serialNumber,
        qrPayloadHash: "wrong-hash",
        status: "ISSUED",
      }),
      student: buildStudent(),
      tenant: buildTenant(),
    };
    prismaMock.certificate.findUnique.mockResolvedValue(cert);

    const res = await GET(
      new Request("http://localhost/api/verification/some-code"),
      { params: Promise.resolve({ code: "some-code" }) },
    );
    const body = (await res.json()) as {
      data: { valid: boolean; integrityValid: boolean; status: string };
    };

    expect(body.data.status).toBe("ISSUED");
    expect(body.data.integrityValid).toBe(false);
    expect(body.data.valid).toBe(false);
  });

  /* ── Audit logging ── */

  it("logs VERIFY_CERTIFICATE audit event on successful verification", async () => {
    const cert = buildCertWithValidHash({ status: "ISSUED" });
    prismaMock.certificate.findUnique.mockResolvedValue(cert);

    await GET(
      new Request("http://localhost/api/verification/valid-uuid-code"),
      { params: Promise.resolve({ code: "valid-uuid-code" }) },
    );

    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "VERIFY_CERTIFICATE",
        entity: "Certificate",
        result: "SUCCESS",
        details: expect.objectContaining({
          publicCode: "valid-uuid-code",
          integrityValid: true,
        }),
      }),
    );
  });

  it("logs FAILURE audit for tampered certificate", async () => {
    const cert = buildCertWithValidHash({ status: "ISSUED" });
    cert.qrPayloadHash = "tampered";
    prismaMock.certificate.findUnique.mockResolvedValue(cert);

    await GET(
      new Request("http://localhost/api/verification/valid-uuid-code"),
      { params: Promise.resolve({ code: "valid-uuid-code" }) },
    );

    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "VERIFY_CERTIFICATE",
        result: "FAILURE",
        details: expect.objectContaining({
          integrityValid: false,
        }),
      }),
    );
  });

  it("does not audit when certificate not found", async () => {
    prismaMock.certificate.findUnique.mockResolvedValue(null);

    await GET(
      new Request("http://localhost/api/verification/nope"),
      { params: Promise.resolve({ code: "nope" }) },
    );

    expect(auditMock).not.toHaveBeenCalled();
  });
});
