import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { resetPasswordSchema } from "@/src/shared/auth/schemas";
import { ok, fail } from "@/src/shared/api/response";
import { ValidationError } from "@/src/shared/errors/app-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Datos inválidos", parsed.error.flatten().fieldErrors);
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: parsed.data.token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new ValidationError("Token inválido o expirado.");
    }

    if (resetToken.usedAt) {
      throw new ValidationError("Este enlace ya fue utilizado.");
    }

    if (resetToken.expiresAt < new Date()) {
      throw new ValidationError("El enlace ha expirado. Solicita uno nuevo.");
    }

    const passwordHash = await hash(parsed.data.password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return ok({ message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    return fail(error);
  }
}
