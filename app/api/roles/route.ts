import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PermissionKey, DataScopeType } from "@prisma/client";

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

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const roles = await prisma.customRole.findMany({
      where: { organizationId: auth.organizationId },
      include: {
        _count: { select: { users: true } },
        permissions: true,
        dataScope: true,
      },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Fetch roles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, icon, color } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const role = await prisma.customRole.create({
      data: {
        name,
        description,
        icon: icon || "user",
        color: color || "text-gray-600",
        organizationId: auth.organizationId,
        // Initialize with default permissions (none allowed)
        permissions: {
          create: Object.values(PermissionKey).map(permission => ({
            permission,
            allowed: false
          }))
        },
        dataScope: {
          create: {
            scopeType: DataScopeType.OWN
          }
        }
      },
      include: {
        permissions: true,
        dataScope: true,
        _count: { select: { users: true } }
      }
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
