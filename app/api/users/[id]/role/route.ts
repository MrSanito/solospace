import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createAuditLog } from "@/lib/audit";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { customRoleId } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { customRole: true }
    });

    if (!currentUser || (currentUser.role !== "CEO" && currentUser.role !== "ORG_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const roleToAssign = await prisma.customRole.findUnique({
      where: { id: customRoleId }
    });

    if (!roleToAssign) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        customRoleId,
        // Also update the legacy role for compatibility if it matches system roles
        role: (roleToAssign.name === "CEO" || roleToAssign.name === "ORG_ADMIN" || roleToAssign.name === "MANAGER" || roleToAssign.name === "SALES_REP") 
          ? roleToAssign.name as any
          : undefined
      },
      include: { customRole: true }
    });

    await createAuditLog({
      organizationId: currentUser.organizationId,
      actorType: "USER",
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: "UPDATE_USER_ROLE",
      note: `Updated role for user ${updatedUser.name} to ${roleToAssign.name}`,
      source: "UI",
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: error.message || "Failed to update role" }, { status: 500 });
  }
}
