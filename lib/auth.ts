import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkPermission } from "./rbac";
import { PermissionKey } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        organizationId: true 
      }
    });
    return user;
  } catch (error) {
    return null;
  }
}

export async function authorize(permission?: PermissionKey) {
  const user = await getAuthUser();
  if (!user) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  if (permission) {
    const hasPermission = await checkPermission(user.id, permission);
    if (!hasPermission) {
      return { authorized: false, status: 403, error: "Forbidden: Lack of permission" };
    }
  }

  return { authorized: true, user };
}

export function authError(res: { status?: number; error?: string }) {
  return NextResponse.json(
    { error: res.error || "Unauthorized" }, 
    { status: res.status || 401 }
  );
}
