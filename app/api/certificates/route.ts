import { randomUUID, createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { auditSuccess } from "@/src/lib/audit";
import { fail, ok } from "@/src/shared/api/response";
import { requirePermission } from "@/src/shared/auth/guards";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/src/shared/errors/app-error";

/* ── Schemas ── */

const createCertificateSchema = z.object({
  studentId: z.string().min(1),
  title: z.string().min(3).max(200),
  degree: z.string().min(2).max(200),
  issueDate: z.string().optional(),
});

/* ── GET  /api/certificates ── */

export async function GET(request: Request) {
  try {
    const session = await requirePermission("certificates:list");
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: session.user.tenantId };
    if (status && ["DRAFT", "ISSUED", "REVOKED"].includes(status)) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { serialNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        {
          student: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { studentCode: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        include: { student: true, tenant: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.certificate.count({ where }),
    ]);

    return ok({ certificates, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return fail(error);
  }
}

/* ── POST  /api/certificates ── */

export async function POST(request: Request) {
  try {
    const session = await requirePermission("certificates:create");
    const body = await request.json();
    const parsed = createCertificateSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Datos de certificado inválidos", parsed.error.flatten());
    }

    const student = await prisma.student.findFirst({
      where: { id: parsed.data.studentId, tenantId: session.user.tenantId },
    });

    if (!student) {
      throw new NotFoundError("Estudiante no encontrado");
    }

    /* ── Duplicate check ── */
    const existing = await prisma.certificate.findFirst({
      where: {
        tenantId: session.user.tenantId,
        studentId: student.id,
        title: parsed.data.title,
        status: { not: "REVOKED" },
      },
    });
    if (existing) {
      throw new ConflictError(
        "Ya existe un certificado activo con el mismo título para este estudiante",
      );
    }

    /* ── Serial + hash ── */
    const count = await prisma.certificate.count({ where: { tenantId: session.user.tenantId } });
    const serialNumber = `RK-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;
    const publicCode = randomUUID();
    const qrPayloadHash = createHash("sha256")
      .update(`${publicCode}:${serialNumber}`)
      .digest("hex");

    const issueDate = parsed.data.issueDate ? new Date(parsed.data.issueDate) : new Date();

    const certificate = await prisma.certificate.create({
      data: {
        tenantId: session.user.tenantId,
        studentId: student.id,
        serialNumber,
        publicCode,
        title: parsed.data.title,
        status: "ISSUED",
        issuedAt: issueDate,
        qrPayloadHash,
        pdfUrl: null,
        metadata: { degree: parsed.data.degree },
      },
      include: { student: true, tenant: true },
    });

    auditSuccess(
      session.user.tenantId,
      session.user.id,
      "ISSUE_CERTIFICATE",
      "Certificate",
      certificate.id,
      { title: certificate.title, student: student.studentCode, serialNumber, degree: parsed.data.degree },
    );

    return ok(certificate, 201);
  } catch (error) {
    return fail(error);
  }
}
