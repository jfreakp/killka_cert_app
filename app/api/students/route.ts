import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { auditSuccess } from "@/src/lib/audit";
import { fail, ok } from "@/src/shared/api/response";
import { requirePermission } from "@/src/shared/auth/guards";
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
    const session = await requirePermission("students:list");

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
    const session = await requirePermission("students:create");
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

    auditSuccess(
      session.user.tenantId,
      session.user.id,
      "CREATE_STUDENT",
      "Student",
      student.id,
      { studentCode: parsed.data.studentCode, name: `${parsed.data.firstName} ${parsed.data.lastName}` },
    );

    return ok(student, 201);
  } catch (error) {
    return fail(error);
  }
}
