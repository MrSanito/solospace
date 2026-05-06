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
            owner: true
          }
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { attachments: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const decryptedThreads = threads.map(t => ({
      ...t,
      messages: t.messages.map(m => ({
        ...m,
        content: decrypt(m.content),
        attachments: m.attachments.map(att => ({
          ...att,
          fileUrl: att.isRestricted ? (null as string | null) : att.fileUrl,
          accessKey: isPrivileged ? (att.accessKey || "SECURE") : null
        }))
      }))
    }));

    return NextResponse.json(decryptedThreads);
  } catch (error) {
    console.error("Chat oversight GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chat threads" }, { status: 500 });
  }
}
