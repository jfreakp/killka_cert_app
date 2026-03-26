"use client";

import { usePermissions } from "@/src/shared/auth/hooks";
import type { Permission } from "@/src/shared/auth/permissions";

interface PermissionGateProps {
  permission: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function PermissionGate({
  permission,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny } = usePermissions();

  const allowed = Array.isArray(permission)
    ? canAny(permission)
    : can(permission);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
