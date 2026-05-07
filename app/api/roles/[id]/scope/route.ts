import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DataScopeType } from "@prisma/client";

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
    const { id: roleId } = await params;
    const body = await request.json();
    const { scopeType } = body;

    if (!Object.values(DataScopeType).includes(scopeType)) {
      return NextResponse.json({ error: "Invalid scope type" }, { status: 400 });
    }

    const updatedScope = await prisma.dataAccessScope.upsert({
      where: { roleId },
      update: { scopeType },
      create: {
        roleId,
        scopeType
      }
    });

    return NextResponse.json({ scope: updatedScope });
  } catch (error) {
    console.error("Update scope error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
