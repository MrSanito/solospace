import { prisma } from "@/lib/prisma";
import { PermissionKey, DataScopeType } from "@prisma/client";

export class AccessControlService {
  static async getRoles(organizationId: string) {
    return prisma.customRole.findMany({
      where: { organizationId },
      orderBy: { orderIndex: "asc" },
      include: {
        permissions: true,
        dataScope: true,
        _count: {
          select: { users: true }
        }
      }
    });
  }

  static async createRole(organizationId: string, data: { name: string; description?: string; icon: string; color: string }) {
    // Get highest orderIndex
    const lastRole = await prisma.customRole.findFirst({
      where: { organizationId },
      orderBy: { orderIndex: "desc" }
    });
    const orderIndex = lastRole ? lastRole.orderIndex + 1 : 0;

    return prisma.$transaction(async (tx) => {
      const role = await tx.customRole.create({
        data: {
          ...data,
          organizationId,
          orderIndex,
          isSystem: false
        }
      });

      // Default data scope
      await tx.dataAccessScope.create({
        data: {
          roleId: role.id,
          scopeType: "ALL"
        }
      });

      // Default permissions (all false)
      const permissionKeys = Object.values(PermissionKey);
      await tx.rolePermission.createMany({
        data: permissionKeys.map(pk => ({
          roleId: role.id,
          permission: pk,
          allowed: false
        }))
      });

      return role;
    });
  }

  static async updateRole(roleId: string, organizationId: string, data: any) {
    const role = await prisma.customRole.findUnique({ where: { id: roleId } });
    if (!role || role.organizationId !== organizationId) throw new Error("Role not found");
    
    if (role.isSystem && (data.name || data.isSystem === false)) {
        // Prevent changing name of system roles for stability
        delete data.name;
    }

    return prisma.customRole.update({
      where: { id: roleId },
      data
    });
  }

  static async deleteRole(roleId: string, organizationId: string) {
    const role = await prisma.customRole.findUnique({ where: { id: roleId } });
    if (!role || role.organizationId !== organizationId) throw new Error("Role not found");
    if (role.isSystem) throw new Error("Cannot delete system roles");

    return prisma.customRole.delete({ where: { id: roleId } });
  }

  static async getPermissions(roleId: string) {
    return prisma.rolePermission.findMany({
      where: { roleId }
    });
  }

  static async updatePermissions(roleId: string, permissions: { permission: PermissionKey; allowed: boolean }[]) {
    return prisma.$transaction(
      permissions.map(p => 
        prisma.rolePermission.updateMany({
          where: { roleId: roleId, permission: p.permission },
          data: { allowed: p.allowed }
        })
      )
    );
  }

  static async getUsers(roleId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.user.findMany({
      where: { customRoleId: roleId },
      select: {
        id: true,
        name: true,
        email: true,
        initials: true,
        avatarUrl: true
      },
      skip,
      take: limit
    });
  }

  static async updateScope(roleId: string, data: { scopeType: DataScopeType; teamId?: string }) {
    return prisma.dataAccessScope.updateMany({
      where: { roleId },
      data: {
        scopeType: data.scopeType,
        teamId: data.teamId || null
      }
    });
  }

  static async getMatrix(organizationId: string) {
    const roles = await prisma.customRole.findMany({
      where: { organizationId },
      orderBy: { orderIndex: "asc" },
      include: {
        permissions: true
      }
    });

    const matrix: any = {};
    const permissionKeys = Object.values(PermissionKey);

    permissionKeys.forEach(pk => {
      matrix[pk] = {};
      roles.forEach(role => {
        const perm = role.permissions.find(p => p.permission === pk);
        matrix[pk][role.id] = perm ? perm.allowed : false;
      });
    });

    return { roles, matrix };
  }
}
