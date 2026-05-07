import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (e) {
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, color } = body;

    const role = await prisma.customRole.update({
      where: { id, organizationId: auth.organizationId },
      data: { name, description, icon, color },
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    // Check if role is a system role
    const role = await prisma.customRole.findUnique({ where: { id } });
    if (role?.isSystem) {
      return NextResponse.json({ error: "System roles cannot be deleted" }, { status: 403 });
    }

    await prisma.customRole.delete({
      where: { id, organizationId: auth.organizationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
