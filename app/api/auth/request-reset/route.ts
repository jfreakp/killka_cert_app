import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/src/lib/prisma";
import { requestResetSchema } from "@/src/shared/auth/schemas";
import { ok, fail } from "@/src/shared/api/response";
import { ValidationError } from "@/src/shared/errors/app-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestResetSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Datos inválidos", parsed.error.flatten().fieldErrors);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return ok({ message: "Si el correo existe, recibirás un enlace de recuperación." });
    }

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // In production, send email with reset link.
    // For dev, log the token to console.
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log(`[DEV] Reset link for ${user.email}: ${resetUrl}`);

    return ok({ message: "Si el correo existe, recibirás un enlace de recuperación." });
  } catch (error) {
    return fail(error);
  }
}
