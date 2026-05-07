import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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

    // Fetch message attachments
    const chatAttachments = await prisma.chatMessageAttachment.findMany({
      where: {
        message: {
          thread: {
            organizationId
          }
        }
      },
      include: {
        message: {
          include: {
            thread: {
              include: {
                lead: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Fetch note attachments
    const noteAttachments = await prisma.noteAttachment.findMany({
      where: {
        note: {
          organizationId
        }
      },
      include: {
        note: {
          include: {
            lead: true,
            user: true
          }
        }
      },
      orderBy: { uploadedAt: "desc" }
    });

    // Fetch direct drive files
    const directFiles = await prisma.driveFile.findMany({
      where: { organizationId },
      include: { uploadedBy: true },
      orderBy: { createdAt: "desc" }
    });

    // Transform into a unified format
    const driveFiles = [
      ...directFiles.map(file => ({
        id: file.id,
        name: file.name,
        owner: file.uploadedBy.name,
        initials: file.uploadedBy.initials,
        color: "bg-teal-600",
        size: (file.fileSize / 1024).toFixed(1) + " KB",
        type: file.fileType.toUpperCase(),
        access: "Internal",
        uploadedAt: file.createdAt.toISOString(),
        isRestricted: file.isRestricted,
        accessKey: isPrivileged ? (file.accessKey || "SECURE") : null,
        url: (!file.isRestricted) ? file.fileUrl : null, // EVEN OWNER MUST UNLOCK
        source: "Drive",
        leadName: "General",
        isFolder: false
      })),
      ...chatAttachments.map(att => ({
        id: att.id,
        name: att.fileName,
        owner: att.message.thread.lead.contactName,
        initials: att.message.thread.lead.contactName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        color: "bg-blue-600",
        size: (att.fileSize / 1024).toFixed(1) + " KB",
        type: att.fileType.toUpperCase(),
        access: "Shared",
        uploadedAt: att.createdAt.toISOString(),
        isRestricted: att.isRestricted,
        accessKey: isPrivileged ? (att.accessKey || "SECURE") : null,
        url: (!att.isRestricted) ? att.fileUrl : null,
        source: "Chat",
        leadName: att.message.thread.lead.contactName,
        isFolder: false
      })),
      ...noteAttachments.map(att => ({
        id: att.id,
        name: att.fileName,
        owner: att.note.user.name,
        initials: att.note.user.initials,
        color: "bg-indigo-600",
        size: (att.fileSizeBytes / 1024).toFixed(1) + " KB",
        type: att.mimeType,
        access: "Internal",
        uploadedAt: att.uploadedAt.toISOString(),
        isRestricted: att.isRestricted,
        accessKey: isPrivileged ? (att.accessKey || "SECURE") : null,
        url: (!att.isRestricted) ? att.fileUrl : null,
        source: "Note",
        leadName: att.note.lead.contactName,
        isFolder: false
      }))
    ].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(driveFiles);
  } catch (error) {
    console.error("Drive GET error:", error);
    return NextResponse.json({ error: "Failed to fetch drive files" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { organizationId, userId } = decoded;

    const { name, fileName, fileUrl, fileType, fileSize } = await req.json();

    const newFile = await prisma.driveFile.create({
      data: {
        name: name || fileName,
        fileName,
        fileUrl,
        fileType,
        fileSize,
        organizationId,
        uploadedById: userId,
        accessKey: Math.random().toString(36).substring(2, 8).toUpperCase(), // Generate 6-char key
        isRestricted: true
      }
    });
    
    // Fetch user for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    
    await createAuditLog({
      organizationId,
      actorType: "USER",
      actorId: userId,
      actorName: user?.name || "Unknown",
      action: "UPLOAD",
      note: `Uploaded file: ${newFile.name}`,
      source: "UI"
    });

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Drive POST error:", error);
    return NextResponse.json({ error: "Failed to upload file to drive" }, { status: 500 });
  }
}
