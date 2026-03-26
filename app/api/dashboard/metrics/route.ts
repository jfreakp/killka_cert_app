import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requireRole } from "@/src/shared/auth/guards";

export async function GET() {
  try {
    const session = await requireRole("SUPER_ADMIN", "TENANT_ADMIN", "ISSUER", "AUDITOR");

    const tenantId = session.user.tenantId;

    const [totalStudents, totalIssued, totalPending, totalRevoked] = await Promise.all([
      prisma.student.count({ where: { tenantId } }),
      prisma.certificate.count({ where: { tenantId, status: "ISSUED" } }),
      prisma.certificate.count({ where: { tenantId, status: "DRAFT" } }),
      prisma.certificate.count({ where: { tenantId, status: "REVOKED" } }),
    ]);

    return ok({
      totalStudents,
      totalIssued,
      totalPending,
      totalRevoked,
      healthScore: 99.9,
    });
  } catch (error) {
    return fail(error);
  }
}
