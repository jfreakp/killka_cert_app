import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requirePermission } from "@/src/shared/auth/guards";
import { NotFoundError, ValidationError } from "@/src/shared/errors/app-error";

/* ── POST  /api/certificates/[id]/revoke ── */

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("certificates:revoke");
    const { id } = await params;

    const certificate = await prisma.certificate.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });

    if (!certificate) {
      throw new NotFoundError("Certificado no encontrado");
    }

    if (certificate.status === "REVOKED") {
      throw new ValidationError("El certificado ya está revocado");
    }

    if (certificate.status === "DRAFT") {
      throw new ValidationError("No se puede revocar un certificado en borrador");
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: { status: "REVOKED", revokedAt: new Date() },
      include: { student: true, tenant: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        actorId: session.user.id,
        action: "REVOKE_CERTIFICATE",
        entity: "Certificate",
        entityId: certificate.id,
        result: "SUCCESS",
        details: { serialNumber: certificate.serialNumber },
      },
    });

    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}
