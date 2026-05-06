import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { encrypt, decrypt } from "@/lib/encryption";

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
                    jobTitle: true,
                    department: true
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
        // If no thread exists yet, return lead info at least
        const leadInfo = await prisma.lead.findUnique({
            where: { id: lead.leadId },
            include: { owner: true }
        });
        return NextResponse.json({ lead: leadInfo, messages: [] });
    }

    if (thread) {
        thread.messages = thread.messages.map(m => ({
            ...m,
            content: decrypt(m.content)
        }));
    }

    return NextResponse.json(thread);
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
        attachments: {
            create: attachments?.map((att: any) => ({
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

    console.log("[LeadChat POST] Message created successfully:", message.id);
    return NextResponse.json(message);
  } catch (error: any) {
    console.error("[LeadChat POST] Error detail:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
