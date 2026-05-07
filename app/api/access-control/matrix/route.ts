import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const roles = await prisma.customRole.findMany({
      where: { organizationId: decoded.organizationId },
      include: {
        permissions: true,
        dataScope: true,
        _count: { select: { users: true } }
      },
      orderBy: { orderIndex: 'asc' }
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Matrix fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
