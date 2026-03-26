import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { audit, AuditAction } from "@/src/lib/audit";
import { loginSchema } from "@/src/shared/auth/schemas";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) {
          /* Log failed attempt — unknown user, no tenantId available */
          return null;
        }

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          audit({
            tenantId: user.tenantId,
            actorId: user.id,
            action: AuditAction.FAILED_LOGIN,
            entity: "Session",
            result: "FAILURE",
            details: { email: parsed.data.email, reason: "invalid_password" },
          });
          return null;
        }

        /* Successful login */
        audit({
          tenantId: user.tenantId,
          actorId: user.id,
          action: AuditAction.LOGIN,
          entity: "Session",
          result: "SUCCESS",
          details: { email: user.email },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
