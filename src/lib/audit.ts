import { prisma } from "@/src/lib/prisma";
import { headers } from "next/headers";

/* ── Action catalog ── */

export const AuditAction = {
  /* Auth */
  LOGIN: "LOGIN",
  FAILED_LOGIN: "FAILED_LOGIN",
  LOGOUT: "LOGOUT",
  PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET: "PASSWORD_RESET",

  /* Certificates */
  ISSUE_CERTIFICATE: "ISSUE_CERTIFICATE",
  REVOKE_CERTIFICATE: "REVOKE_CERTIFICATE",
  UPLOAD_PDF: "UPLOAD_PDF",
  VERIFY_CERTIFICATE: "VERIFY_CERTIFICATE",

  /* Students */
  CREATE_STUDENT: "CREATE_STUDENT",
  UPDATE_STUDENT: "UPDATE_STUDENT",
  DELETE_STUDENT: "DELETE_STUDENT",

  /* Users */
  CREATE_USER: "CREATE_USER",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

/* ── Entity catalog ── */

export const AuditEntity = {
  User: "User",
  Certificate: "Certificate",
  Student: "Student",
  Session: "Session",
} as const;

/* ── Input ── */

export interface AuditInput {
  tenantId: string;
  actorId?: string | null;
  action: AuditActionType;
  entity: string;
  entityId?: string | null;
  result: "SUCCESS" | "FAILURE";
  details?: Record<string, unknown>;
}

/* ── Capture request context (IP + UA) ── */

async function getRequestContext() {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    const ipAddress = forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
    const userAgent = h.get("user-agent") ?? null;
    return { ipAddress, userAgent };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

/* ── Core: fire-and-forget audit log ── */

export async function audit(input: AuditInput): Promise<void> {
  const ctx = await getRequestContext();

  /* Non-blocking: don't await in the caller's hot path */
  prisma.auditLog
    .create({
      data: {
        tenantId: input.tenantId,
        actorId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        result: input.result,
        details: input.details ? (input.details as unknown as import("@prisma/client").Prisma.InputJsonValue) : undefined,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      },
    })
    .catch((err) => {
      console.error("[audit] Failed to write audit log:", err);
    });
}

/* ── Convenience helpers ── */

export function auditSuccess(
  tenantId: string,
  actorId: string,
  action: AuditActionType,
  entity: string,
  entityId?: string,
  details?: Record<string, unknown>,
) {
  return audit({ tenantId, actorId, action, entity, entityId, result: "SUCCESS", details });
}

export function auditFailure(
  tenantId: string,
  actorId: string | null,
  action: AuditActionType,
  entity: string,
  details?: Record<string, unknown>,
) {
  return audit({ tenantId, actorId, action, entity, result: "FAILURE", details });
}
