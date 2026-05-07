import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createAuditLog } from "@/lib/audit";
import { scanAuditLogsForSuspiciousActivity } from "@/lib/security-engine";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

async function getAuthUser(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, organizationId: true, role: true, name: true },
    });
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Trigger on-demand scan for today's logs before fetching
    await scanAuditLogsForSuspiciousActivity(user.organizationId);

    const alerts = await prisma.securityEWS.findMany({
      where: {
        organizationId: user.organizationId,
        // If ORG_ADMIN or MANAGER, show all organization alerts. Otherwise only user's alerts.
        ...(user.role === 'ORG_ADMIN' || user.role === 'MANAGER' ? {} : { userId: user.id })
      },
      include: {
        lead: { select: { contactName: true, company: true } },
        user: { select: { name: true, role: true, initials: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });


    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Alerts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, status } = await req.json();
    const updated = await prisma.securityEWS.update({
      where: { id, organizationId: user.organizationId },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.alert.deleteMany({
      where: {
        organizationId: user.organizationId,
        userId: user.id,
      },
    });

    // Create Audit Log
    await createAuditLog({
      organizationId: user.organizationId,
      actorType: "USER",
      actorId: user.id,
      actorName: user.name || "Unknown",
      action: "CLEAR_ALERTS",
      note: `Cleared all pending notification alerts from the dashboard.`,
      source: "UI",
    });

    return NextResponse.json({ message: "Alerts cleared" });
  } catch (error) {
    console.error("Alerts DELETE error:", error);
    return NextResponse.json({ error: "Failed to clear alerts" }, { status: 500 });
  }
}
