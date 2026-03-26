import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requirePermission } from "@/src/shared/auth/guards";

export async function GET() {
  try {
    const session = await requirePermission("dashboard:view");
    const tenantId = session.user.tenantId;

    const logs = await prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const activity = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      result: log.result,
      actorName: log.actor?.name ?? log.actor?.email ?? "Sistema",
      actorRole: log.actor?.role ?? null,
      createdAt: log.createdAt.toISOString(),
    }));

    return ok(activity);
  } catch (error) {
    return fail(error);
  }
}
