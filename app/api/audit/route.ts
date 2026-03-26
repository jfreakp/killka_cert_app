import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requirePermission } from "@/src/shared/auth/guards";

export async function GET(request: Request) {
  try {
    const session = await requirePermission("audit:list");
    const { searchParams } = new URL(request.url);

    /* ── Filters ── */
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");
    const result = searchParams.get("result");
    const actorId = searchParams.get("actorId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 50)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: session.user.tenantId };

    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (result) where.result = result;
    if (actorId) where.actorId = actorId;

    /* Date range */
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to + "T23:59:59.999Z");
      where.createdAt = dateFilter;
    }

    /* Free text search across action, entity, entityId */
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search, mode: "insensitive" } },
        { actor: { name: { contains: search, mode: "insensitive" } } },
        { actor: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          actor: { select: { id: true, email: true, name: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    /* Distinct values for filter dropdowns */
    const [actions, entities] = await Promise.all([
      prisma.auditLog.findMany({
        where: { tenantId: session.user.tenantId },
        distinct: ["action"],
        select: { action: true },
        orderBy: { action: "asc" },
      }),
      prisma.auditLog.findMany({
        where: { tenantId: session.user.tenantId },
        distinct: ["entity"],
        select: { entity: true },
        orderBy: { entity: "asc" },
      }),
    ]);

    return ok({
      logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      filters: {
        actions: actions.map((a) => a.action),
        entities: entities.map((e) => e.entity),
      },
    });
  } catch (error) {
    return fail(error);
  }
}
