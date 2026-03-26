import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requireRole } from "@/src/shared/auth/guards";
import { ValidationError } from "@/src/shared/errors/app-error";

const createStudentSchema = z.object({
  studentCode: z.string().min(3),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional(),
  career: z.string().min(2),
});

export async function GET() {
  try {
    const session = await requireRole("SUPER_ADMIN", "TENANT_ADMIN", "ISSUER", "AUDITOR");

    const students = await prisma.student.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok(students);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("SUPER_ADMIN", "TENANT_ADMIN", "ISSUER");
    const body = await request.json();
    const parsed = createStudentSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Datos de estudiante inválidos", parsed.error.flatten());
    }

    const student = await prisma.student.create({
      data: {
        tenantId: session.user.tenantId,
        ...parsed.data,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        actorId: session.user.id,
        action: "CREATE_STUDENT",
        entity: "Student",
        entityId: student.id,
        result: "SUCCESS",
      },
    });

    return ok(student, 201);
  } catch (error) {
    return fail(error);
  }
}
