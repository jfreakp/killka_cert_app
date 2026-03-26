import { createHash } from "crypto";
import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { publicCode: code },
      include: {
        tenant: true,
        student: true,
      },
    });

    if (!certificate) {
      return ok({
        valid: false,
        status: "NOT_FOUND",
        message: "Certificado no encontrado",
      });
    }

    /* ── Integrity check: recompute hash ── */
    const expectedHash = createHash("sha256")
      .update(`${certificate.publicCode}:${certificate.serialNumber}`)
      .digest("hex");
    const integrityValid = certificate.qrPayloadHash === expectedHash;

    return ok({
      valid: certificate.status === "ISSUED" && integrityValid,
      status: certificate.status,
      integrityValid,
      studentName: `${certificate.student.firstName} ${certificate.student.lastName}`,
      studentCode: certificate.student.studentCode,
      university: certificate.tenant.name,
      title: certificate.title,
      degree: (certificate.metadata as Record<string, unknown>)?.degree ?? certificate.title,
      issuedAt: certificate.issuedAt,
      revokedAt: certificate.revokedAt,
      serialNumber: certificate.serialNumber,
      pdfUrl: certificate.pdfUrl,
    });
  } catch (error) {
    return fail(error);
  }
}
