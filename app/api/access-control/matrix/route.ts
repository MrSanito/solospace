import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { checkPermission } from "@/lib/rbac";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const hasPermission = await checkPermission(decoded.userId, "ACCESS_CONTROL");
    if (!hasPermission) {
      return NextResponse.json({ error: "Permission Denied" }, { status: 403 });
    }

    const roles = await prisma.customRole.findMany({
      where: { organizationId: decoded.organizationId },
      include: {
        permissions: true,
        dataScope: true,
        _count: { select: { users: true } }
      },
      orderBy: { orderIndex: 'asc' }
    });

    const restrictedDriveFiles = await prisma.driveFile.count({
      where: { organizationId: decoded.organizationId, isRestricted: true }
    });
    
    const restrictedNoteAttachments = await prisma.noteAttachment.count({
      where: { 
        isRestricted: true,
        note: { organizationId: decoded.organizationId }
      }
    });

    const restrictedChatAttachments = await prisma.chatMessageAttachment.count({
      where: {
        isRestricted: true,
        message: { thread: { organizationId: decoded.organizationId } }
      }
    });

    const restrictedCount = restrictedDriveFiles + restrictedNoteAttachments + restrictedChatAttachments;

    return NextResponse.json({ roles, restrictedCount });
  } catch (error) {
    console.error("Matrix fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
