import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
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
    const organizationId = decoded.organizationId;

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

    return NextResponse.json(threads);
  } catch (error) {
    console.error("Chat oversight GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chat threads" }, { status: 500 });
  }
}
