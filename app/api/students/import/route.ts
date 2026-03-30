import { prisma } from "@/src/lib/prisma";
import { requirePermission } from "@/src/shared/auth/guards";
import { fail, ok } from "@/src/shared/api/response";
import { ValidationError } from "@/src/shared/errors/app-error";

export async function POST(request: Request) {
  try {
    const session = await requirePermission("students:create");
    const body = await request.json();
    if (!Array.isArray(body.students)) throw new ValidationError("Formato de datos inválido");
    const students = body.students.filter(
      (s: any) => s.studentCode && s.firstName && s.lastName && s.career
    );
    if (students.length === 0) throw new ValidationError("No hay estudiantes válidos");
    const created = [];
    for (const s of students) {
      try {
        const student = await prisma.student.upsert({
          where: {
            tenantId_studentCode: {
              tenantId: session.user.tenantId,
              studentCode: s.studentCode,
            },
          },
          update: {
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            career: s.career,
          },
          create: {
            tenantId: session.user.tenantId,
            studentCode: s.studentCode,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            career: s.career,
          },
        });
        created.push(student);
      } catch {}
    }
    return ok({ count: created.length });
  } catch (error) {
    return fail(error);
  }
}
