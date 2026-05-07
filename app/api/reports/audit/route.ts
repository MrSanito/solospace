import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { decrypt } from "@/lib/encryption";
import { checkPermission } from "@/lib/rbac";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, organizationId: true, role: true },
    });
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const hasPermission = await checkPermission(user.id, "AUDIT_LOGS");
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden: No permission to view audit logs" }, { status: 403 });
    }

    if (!prisma.auditLog) {
      console.error("Audit Report Error: prisma.auditLog is undefined. Models:", Object.keys(prisma).filter(k => !k.startsWith("_")));
      return NextResponse.json({ error: "Prisma client out of sync" }, { status: 500 });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        lead: {
          select: {
            contactName: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500, // Limit for performance
    });

    const decryptedLogs = auditLogs.map(log => ({
      ...log,
      note: log.note ? decrypt(log.note) : log.note,
      beforeValue: typeof log.beforeValue === "string" ? decrypt(log.beforeValue) : log.beforeValue,
      afterValue: typeof log.afterValue === "string" ? decrypt(log.afterValue) : log.afterValue,
    }));

    return NextResponse.json(decryptedLogs);
  } catch (error) {
    console.error("Audit Report GET error:", error);
    return NextResponse.json({ error: "Failed to fetch audit report" }, { status: 500 });
  }
}
