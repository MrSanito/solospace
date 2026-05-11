import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { encrypt, decrypt, generateAccessKey } from "@/lib/encryption";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

async function getLeadFromToken() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("leadToken")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  const lead = await getLeadFromToken();
  if (!lead) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const thread = await prisma.chatThread.findUnique({
      where: { leadId: lead.leadId },
      include: {
        lead: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                role: true,
                jobTitle: true,
                department: true
              }
            },
            notes: {
              include: {
                attachments: true
              }
            },
            auditLogs: {
              orderBy: { createdAt: "desc" },
              take: 5
            }
          }
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { attachments: true }
        }
      }
    });

    if (!thread) {
      const leadInfo = await prisma.lead.findUnique({
        where: { id: lead.leadId },
        include: { owner: true }
      });
      return NextResponse.json({ lead: leadInfo, messages: [], sharedFiles: [] });
    }

    // Collect message attachments
    const messageAttachments = thread.messages.flatMap(m => m.attachments.map(att => ({
      ...att,
      source: "CHAT"
    })));

    // Collect note attachments
    const noteAttachments = (thread.lead.notes || []).flatMap(n => n.attachments.map(att => ({
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

    // Extract participant IDs (USER type)
    const participantIds = Array.from(new Set(thread.messages
      .filter(m => m.senderType === "USER" && m.senderId)
      .map(m => m.senderId as string)
    ));

    const participants = await prisma.user.findMany({
      where: { id: { in: participantIds } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        jobTitle: true,
        department: true
      }
    });

    // Get Lead Owner info
    const owner = thread.lead.owner;

    const decryptedThread = {
      ...thread,
      participants: participants,
      sharedFiles: allFiles,
      messages: thread.messages
        .filter(m => m.senderId === lead.leadId || m.receiverId === lead.leadId || !m.receiverId) // Show messages sent by or received by this lead
        .map(m => {
          const isUser = m.senderType === "USER";
          const sender = isUser ? participants.find(p => p.id === m.senderId) : null;
          
          return {
            ...m,
            content: decrypt(m.content),
            senderId: m.senderId,
            senderName: isUser ? (sender?.name || owner?.name || "Company Support") : thread.lead.contactName,
            senderAvatar: isUser ? (sender?.avatarUrl || owner?.avatarUrl || null) : null,
            senderRole: isUser ? (sender?.role || owner?.role || "SUPPORT") : "LEAD"
          };
        })
    };

    return NextResponse.json(decryptedThread);
  } catch (error: any) {
    console.error("[LeadChat GET] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const lead = await getLeadFromToken();
  if (!lead) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content, attachments } = await req.json();
    console.log("[LeadChat POST] Received:", { content, attachmentsCount: attachments?.length });

    const hasContent = content && content.trim().length > 0;
    const hasAttachments = attachments && attachments.length > 0;

    if (!hasContent && !hasAttachments) {
        return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Find or create thread
    let thread = await prisma.chatThread.findUnique({
      where: { leadId: lead.leadId }
    });

    if (!thread) {
      console.log("[LeadChat POST] Creating new thread for lead:", lead.leadId);
      thread = await prisma.chatThread.create({
        data: {
          leadId: lead.leadId,
          organizationId: lead.organizationId
        }
      });
    }

    console.log("[LeadChat POST] Creating message in thread:", thread.id);
    const message = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        content: encrypt(content || ""),
        senderType: "LEAD",
        senderId: lead.leadId,
        receiverId: thread.organizationId, // Send to organization/owner
        attachments: {
            create: attachments?.map((att: any) => ({
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                fileType: att.fileType,
                fileSize: att.fileSize,
                accessKey: generateAccessKey(),
                isRestricted: true
            }))
        }
      },
      include: { attachments: true }
    });

    console.log("[LeadChat POST] Message created successfully:", message.id);
    return NextResponse.json(message);
  } catch (error: any) {
    console.error("[LeadChat POST] Error detail:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
