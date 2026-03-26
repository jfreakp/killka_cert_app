import { getServerSession } from "next-auth";
import { authOptions } from "@/src/shared/auth/session";
import { ForbiddenError, UnauthorizedError } from "@/src/shared/errors/app-error";
import { UserRole } from "@prisma/client";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError();
  }
  return session;
}
