"use client";

import { useSession } from "next-auth/react";
import {
  hasPermission,
  hasAnyPermission,
  getPermissions,
  type Role,
  type Permission,
} from "./permissions";

export function usePermissions() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  return {
    role,
    permissions: role ? getPermissions(role) : [],
    can: (permission: Permission) => (role ? hasPermission(role, permission) : false),
    canAny: (permissions: Permission[]) => (role ? hasAnyPermission(role, permissions) : false),
  };
}
