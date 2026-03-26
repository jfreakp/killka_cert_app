import { randomUUID, createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requireRole } from "@/src/shared/auth/guards";
import { NotFoundError, ValidationError } from "@/src/shared/errors/app-error";

const createCertificateSchema = z.object({
  studentId: z.string().min(1),
  title: z.string().min(3),
});

export async function GET() {
  try {
    const session = await requireRole("SUPER_ADMIN", "TENANT_ADMIN", "ISSUER", "AUDITOR");

    const certificates = await prisma.certificate.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        student: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok(certificates);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("SUPER_ADMIN", "TENANT_ADMIN", "ISSUER");
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

    const count = await prisma.certificate.count({ where: { tenantId: session.user.tenantId } });
    const serialNumber = `RK-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;
    const publicCode = randomUUID();
    const qrPayloadHash = createHash("sha256").update(`${publicCode}:${serialNumber}`).digest("hex");

    const certificate = await prisma.certificate.create({
      data: {
        tenantId: session.user.tenantId,
        studentId: student.id,
        serialNumber,
        publicCode,
        title: parsed.data.title,
        status: "ISSUED",
        issuedAt: new Date(),
        qrPayloadHash,
        pdfUrl: null,
      },
      include: {
        student: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        actorId: session.user.id,
        action: "ISSUE_CERTIFICATE",
        entity: "Certificate",
        entityId: certificate.id,
        result: "SUCCESS",
      },
    });

    return ok(certificate, 201);
  } catch (error) {
    return fail(error);
  }
}
