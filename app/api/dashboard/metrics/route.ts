import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requirePermission } from "@/src/shared/auth/guards";

export async function GET() {
  try {
    const session = await requirePermission("dashboard:view");

    const tenantId = session.user.tenantId;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      totalIssued,
      totalPending,
      totalRevoked,
      issuedLast30,
      studentsLast30,
      dailyCerts,
    ] = await Promise.all([
      prisma.student.count({ where: { tenantId } }),
      prisma.certificate.count({ where: { tenantId, status: "ISSUED" } }),
      prisma.certificate.count({ where: { tenantId, status: "DRAFT" } }),
      prisma.certificate.count({ where: { tenantId, status: "REVOKED" } }),
      prisma.certificate.count({
        where: { tenantId, status: "ISSUED", issuedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.student.count({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      }),
      // Daily certificate counts for the last 30 days (for chart)
      prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE("issuedAt") as date, COUNT(*)::bigint as count
        FROM "Certificate"
        WHERE "tenantId" = ${tenantId}
          AND "status" = 'ISSUED'
          AND "issuedAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("issuedAt")
        ORDER BY date ASC
      `,
    ]);

    // Build a 30-day array for the chart (fill gaps with 0)
    const chartData: { date: string; certificados: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      const found = dailyCerts.find(
        (r) => new Date(r.date).toISOString().slice(0, 10) === key,
      );
      chartData.push({
        date: key,
        certificados: found ? Number(found.count) : 0,
      });
    }

    return ok({
      totalStudents,
      totalIssued,
      totalPending,
      totalRevoked,
      issuedLast30,
      studentsLast30,
      chartData,
    });
  } catch (error) {
    return fail(error);
  }
}
