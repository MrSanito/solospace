import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createAuditLog } from "@/lib/audit";
import { encrypt, decrypt } from "@/lib/encryption";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) return NextResponse.json({ error: "Missing leadId" }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const isPrivileged = token ? (jwt.verify(token, JWT_SECRET) as any).role === "ORG_ADMIN" || (jwt.verify(token, JWT_SECRET) as any).role === "MANAGER" : false;

    const thread = await prisma.chatThread.findUnique({
      where: { leadId },
      include: {
        lead: true,
        messages: {
          orderBy: { createdAt: "asc" },
          include: { attachments: true }
        }
      }
    });

    const userIds = Array.from(new Set(thread?.messages.filter(m => m.senderType === "USER" && m.senderId).map(m => m.senderId as string) || []));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, role: true, avatarUrl: true }
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const safeThread = thread ? {
      ...thread,
      messages: thread.messages.map(m => ({
        ...m,
        content: decrypt(m.content),
        senderName: m.senderType === "USER" ? userMap[m.senderId!]?.name : thread.lead.contactName,
        senderRole: m.senderType === "USER" ? userMap[m.senderId!]?.role : "LEAD",
        senderAvatar: m.senderType === "USER" ? userMap[m.senderId!]?.avatarUrl : null,
        attachments: m.attachments.map(att => ({
          ...att,
          fileUrl: att.isRestricted ? (null as string | null) : att.fileUrl,
          accessKey: isPrivileged ? (att.accessKey || "SECURE") : null
        }))
      }))
    } : null;

    return NextResponse.json(safeThread);
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, content, senderType, senderId, receiverId, attachments } = body;
    console.log("[OversightChat POST] Received:", { leadId, senderType, content, attachmentsCount: attachments?.length });

    // Check if at least one of content or attachments is present
    const hasContent = content && content.trim().length > 0;
    const hasAttachments = attachments && attachments.length > 0;

    if (!leadId || !senderType || (!hasContent && !hasAttachments)) {
      console.warn("[OversightChat POST] Validation failed:", { leadId, senderType, hasContent, hasAttachments });
      return NextResponse.json({ error: "Missing required fields or empty message" }, { status: 400 });
    }

    // Find or create thread
    let thread = await prisma.chatThread.findUnique({
      where: { leadId }
    });

    if (!thread) {
      console.log("[OversightChat POST] Creating new thread for lead:", leadId);
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { organizationId: true }
      });
      if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

      thread = await prisma.chatThread.create({
        data: {
          leadId,
          organizationId: lead.organizationId
        }
      });
    }

    console.log("[OversightChat POST] Creating message in thread:", thread.id);

    const message = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        content: encrypt(content || ""),
        senderType,
        senderId: senderId || null,
        receiverId: receiverId || leadId, // Default to leadId if not specified
        attachments: {
            create: body.attachments?.map((att: any) => ({
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                fileType: att.fileType,
                fileSize: att.fileSize,
                accessKey: Math.random().toString(36).substring(2, 8).toUpperCase(),
                isRestricted: true
            }))
        }
      },
      include: { attachments: true }
    });

    // Fetch Actor Name for Audit Log
    let actorName = senderType === "LEAD" ? "Lead" : "User";
    if (senderType === "USER" && senderId) {
      const user = await prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true }
      });
      if (user) actorName = user.name;
    } else if (senderType === "LEAD") {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { contactName: true }
      });
      if (lead) actorName = lead.contactName;
    }

    // Create Audit Log for Chat
    await createAuditLog({
      organizationId: thread.organizationId,
      leadId,
      actorType: senderType === "USER" ? "USER" : "AI", 
      actorId: senderId || leadId,
      actorName: actorName,
      action: "CHAT",
      note: encrypt(`Chat message: ${content}`),
      source: "UI",
    });

    // Strip fileUrl from response to enforce zero-trust even for the sender
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const isPrivileged = token ? (jwt.verify(token, JWT_SECRET) as any).role === "ORG_ADMIN" || (jwt.verify(token, JWT_SECRET) as any).role === "MANAGER" : false;

    const safeMessage = {
      ...message,
      attachments: message.attachments.map(att => ({
        ...att,
        fileUrl: att.isRestricted ? null : att.fileUrl,
        accessKey: isPrivileged ? (att.accessKey || "SECURE") : null
      }))
    };

    return NextResponse.json(safeMessage);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
