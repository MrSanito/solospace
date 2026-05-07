import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { decrypt } from "@/lib/encryption";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { organizationId, role } = decoded;
    const isPrivileged = role === "ORG_ADMIN" || role === "MANAGER";

    const threads = await prisma.chatThread.findMany({
      where: { organizationId },
      include: {
        lead: {
          include: {
            owner: true,
            notes: {
              include: {
                attachments: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { attachments: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Collect all unique senderIds from messages
    const senderIds = Array.from(new Set(threads.flatMap(t => 
      t.messages.filter(m => m.senderType === "USER" && m.senderId).map(m => m.senderId as string)
    )));

    // Fetch user details for these senders
    const users = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, avatarUrl: true, role: true }
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const decryptedThreads = threads.map(t => {
      // Collect message attachments
      const messageAttachments = t.messages.flatMap(m => m.attachments.map(att => ({
        ...att,
        source: "CHAT"
      })));

      // Collect note attachments
      const noteAttachments = (t.lead.notes || []).flatMap(n => n.attachments.map(att => ({
        ...att,
        fileType: att.mimeType,
        fileSize: att.fileSizeBytes,
        createdAt: att.uploadedAt, // Normalize date field
        source: "NOTE"
      })));

      // Combine and sort by date
      const allFiles = [...messageAttachments, ...noteAttachments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        ...t,
        sharedFiles: allFiles.map(file => ({
          ...file,
          fileUrl: file.isRestricted ? (null as string | null) : file.fileUrl,
          accessKey: isPrivileged ? (file.accessKey || "SECURE") : null
        })),
        messages: t.messages.map(m => ({
          ...m,
          senderName: m.senderId ? userMap[m.senderId]?.name : null,
          content: decrypt(m.content),
          attachments: m.attachments.map(att => ({
            ...att,
            fileUrl: att.isRestricted ? (null as string | null) : att.fileUrl,
            accessKey: isPrivileged ? (att.accessKey || "SECURE") : null
          }))
        }))
      };
    });

    return NextResponse.json({ threads: decryptedThreads, users: userMap });
  } catch (error) {
    console.error("Chat oversight GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chat threads" }, { status: 500 });
  }
}
