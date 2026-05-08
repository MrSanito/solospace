import { prisma } from "@/lib/prisma";
import { authorize, authError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await authorize();
  if (!auth.authorized) return authError(auth);

  const { organizationId } = auth.user!;

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // 1. Fetch recent audit logs for sessions
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      organizationId,
      action: { in: ["LOGIN", "LOGOUT", "FAILED_LOGIN"] },
      createdAt: { gte: twentyFourHoursAgo }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  // 2. Fetch security events
  const securityEvents = await prisma.securityEWS.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { 
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          initials: true
        }
      } 
    },
    take: 50
  });

  // 3. Stats calculation
  const activeSessionsCount = await prisma.auditLog.count({
    where: {
      organizationId,
      action: "LOGIN",
      createdAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) } // Active in last 12h
    }
  });

  const uniqueLogins = await prisma.auditLog.groupBy({
    by: ['actorId'],
    where: {
      organizationId,
      action: "LOGIN",
      createdAt: { gte: twentyFourHoursAgo }
    }
  });

  const failedAttempts = await prisma.auditLog.count({
    where: {
      organizationId,
      action: "FAILED_LOGIN",
      createdAt: { gte: twentyFourHoursAgo }
    }
  });

  const suspiciousEvents = await prisma.securityEWS.count({
    where: {
      organizationId,
      createdAt: { gte: twentyFourHoursAgo },
      status: "NEW"
    }
  });

  // 4. Enrich audit logs with user info (since relation is missing)
  const actorIds = [...new Set(auditLogs.map(log => log.actorId).filter(Boolean))] as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      initials: true
    }
  });

  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const enrichedLogs = auditLogs.map(log => ({
    ...log,
    user: log.actorId ? userMap[log.actorId] : null
  }));

  return NextResponse.json({
    sessions: enrichedLogs.filter(log => log.action === "LOGIN"),
    loginHistory: enrichedLogs,
    securityEvents,
    stats: {
      activeSessions: activeSessionsCount,
      uniqueLogins: uniqueLogins.length,
      failedAttempts,
      suspiciousEvents,
      mfaAdoption: "100%"
    }
  });
}
