import { PermissionKey, DataScopeType } from "@prisma/client";

export interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  orderIndex: number;
  isSystem: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    users: number;
  };
}

export interface RolePermission {
  id: string;
  customRoleId: string;
  permission: PermissionKey;
  allowed: boolean;
}

export interface DataAccessScope {
  id: string;
  customRoleId: string;
  scopeType: DataScopeType;
  teamId: string | null;
}

export interface AccessMatrixResponse {
  roles: CustomRole[];
  matrix: Record<PermissionKey, Record<string, boolean>>;
}

export interface RoleWithDetails extends CustomRole {
  permissions: RolePermission[];
  dataScope: DataAccessScope | null;
}
