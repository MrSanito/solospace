import { prisma } from "./prisma";
import { PermissionKey, DataScopeType } from "@prisma/client";

export async function checkPermission(userId: string, permission: PermissionKey): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customRole: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user) return false;

  // CEO and ORG_ADMIN bypass checks for now, or we can rely on their seeded permissions
  if (user.role === "CEO" || user.role === "ORG_ADMIN") return true;

  if (!user.customRole) return false;

  const perm = user.customRole.permissions.find((p) => p.permission === permission);
  return perm ? perm.allowed : false;
}

export async function getDataScope(userId: string): Promise<{ scope: DataScopeType, teamId?: string | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customRole: {
        include: {
          dataScope: true,
        },
      },
    },
  });

  if (!user) return { scope: "OWN" };

  if (user.role === "CEO" || user.role === "ORG_ADMIN") return { scope: "ALL" };

  if (!user.customRole || !user.customRole.dataScope) {
    // Default scopes based on legacy roles if no custom role
    if (user.role === "MANAGER") return { scope: "TEAM", teamId: user.teamId };
    return { scope: "OWN" };
  }

  return {
    scope: user.customRole.dataScope.scopeType,
    teamId: user.customRole.dataScope.teamId || user.teamId,
  };
}
