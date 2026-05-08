import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAgent = req.headers.get("user-agent") || "Unknown";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const { fileId, accessKey } = await req.json();

    if (!fileId || !accessKey) {
      return NextResponse.json({ error: "Missing fileId or accessKey" }, { status: 400 });
    }

    let file: any = await prisma.driveFile.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      file = await prisma.chatMessageAttachment.findUnique({
        where: { id: fileId }
      });
    }

    if (!file) {
      file = await prisma.noteAttachment.findUnique({
        where: { id: fileId }
      });
    }

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.accessKey === accessKey.toUpperCase()) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { organizationId: true, name: true }
      });

      if (user) {
        const note = JSON.stringify({
          message: `Unlocked file: ${file.name || file.fileName}`,
          device: userAgent,
          ip: ip
        });

        await createAuditLog({
          organizationId: user.organizationId,
          actorType: "USER",
          actorId: decoded.userId,
          actorName: user.name,
          action: "DECRYPT",
          note,
          source: "UI"
        });

        // EWS Check: File Access Spike
        const { checkFileAccessSpike } = await import("@/lib/ews");
        await checkFileAccessSpike(decoded.userId, user.organizationId, note, ip, userAgent);
      }

      return NextResponse.json({ url: file.fileUrl });
    } else {
      return NextResponse.json({ error: "Invalid access key" }, { status: 403 });
    }
  } catch (error) {
    console.error("Drive Unlock error:", error);
    return NextResponse.json({ error: "Failed to unlock file" }, { status: 500 });
  }
}
