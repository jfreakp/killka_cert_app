import { createHash } from "crypto";
import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requirePermission } from "@/src/shared/auth/guards";
import { NotFoundError } from "@/src/shared/errors/app-error";

/* ── GET  /api/certificates/[id] ── */

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("certificates:list");
    const { id } = await params;

    const certificate = await prisma.certificate.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: { student: true, tenant: true },
    });

    if (!certificate) {
      throw new NotFoundError("Certificado no encontrado");
    }

    /* integrity check – recompute hash */
    const expectedHash = createHash("sha256")
      .update(`${certificate.publicCode}:${certificate.serialNumber}`)
      .digest("hex");

    return ok({
      ...certificate,
      integrityValid: certificate.qrPayloadHash === expectedHash,
    });
  } catch (error) {
    return fail(error);
  }
}
