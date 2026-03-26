import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requireRole } from "@/src/shared/auth/guards";

export async function GET() {
  try {
    const session = await requireRole("SUPER_ADMIN", "TENANT_ADMIN", "AUDITOR");

    const logs = await prisma.auditLog.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return ok(logs);
  } catch (error) {
    return fail(error);
  }
}
