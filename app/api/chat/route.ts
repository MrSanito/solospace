import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createAuditLog } from "@/lib/audit";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) return NextResponse.json({ error: "Missing leadId" }, { status: 400 });

    const thread = await prisma.chatThread.findUnique({
      where: { leadId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, content, senderType, senderId } = body;

    if (!leadId || !content || !senderType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create thread
    let thread = await prisma.chatThread.findUnique({
      where: { leadId }
    });

    if (!thread) {
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

    const message = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        content,
        senderType,
        senderId: senderId || null
      }
    });

    // Create Audit Log for Chat
    await createAuditLog({
      organizationId: thread.organizationId,
      leadId,
      actorType: senderType === "USER" ? "USER" : "AI", // Default to AI for Lead sender in audit logs if needed
      actorId: senderId,
      actorName: senderType === "USER" ? "User" : "Lead",
      action: "CHAT",
      note: `Chat message sent: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      source: "UI",
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
