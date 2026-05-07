import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { scanAuditLogsForSuspiciousActivity } from "@/lib/security-engine";
import { createAuditLog } from "@/lib/audit";

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

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only Admins or CEOs can trigger manual scans
    if (user.role !== "ORG_ADMIN" && user.role !== "CEO") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const count = await scanAuditLogsForSuspiciousActivity(user.organizationId);

    // Create Audit Log for the scan action
    await createAuditLog({
      organizationId: user.organizationId,
      actorType: "USER",
      actorId: user.id,
      actorName: user.name || "Unknown",
      action: "SECURITY_SCAN",
      note: `Manually triggered security scan. Found ${count} new alerts.`,
      source: "UI",
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Scan POST error:", error);
    return NextResponse.json({ error: "Failed to run scan" }, { status: 500 });
  }
}
