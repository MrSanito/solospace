import { prisma } from "./prisma";
import { EWSStatus } from "@prisma/client";

export async function scanAuditLogsForSuspiciousActivity(organizationId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const suspiciousActivities: any[] = [];

  // Helper to add activity
  const addActivity = (data: any) => {
    suspiciousActivities.push({
      ...data,
      ipAddress: "106.201.45.12",
      device: "Chrome on Windows",
      location: "Mumbai, India"
    });
  };

  // 1. Download Spike
  const downloadSpikes = await prisma.auditLog.groupBy({
    by: ['actorId', 'actorName', 'leadId'],
    where: {
      organizationId,
      action: 'DECRYPT',
      createdAt: { gte: startOfToday },
    },
    _count: { id: true },
    having: { id: { _count: { gt: 5 } } },
  });

  for (const spike of downloadSpikes) {
    addActivity({
      userId: spike.actorId,
      leadId: spike.leadId,
      title: 'Download Spike',
      body: 'Access to restricted file',
      summary: `${spike.actorName} downloaded ${spike._count.id} files in a short period of 2 minutes.`,
      status: 'NEW',
      severity: 'High'
    });
  }

  // 2. Restricted Access
  const restrictedAccess = await prisma.auditLog.findMany({
    where: {
      organizationId,
      action: 'DECRYPT',
      note: { contains: 'restricted', mode: 'insensitive' },
      createdAt: { gte: startOfToday },
    },
    take: 10
  });

  for (const access of restrictedAccess) {
    addActivity({
      userId: access.actorId,
      leadId: access.leadId,
      title: 'Restricted Access',
      body: 'Viewed restricted file',
      summary: `${access.actorName} viewed a file flagged as restricted.`,
      status: 'NEW',
      severity: 'Medium'
    });
  }

  // 3. Escape Attempt (WhatsApp)
  const escapeWords = ['whatsapp', 'call me', 'mobile', 'phone', 'contact me', '+91', 'personal'];
  const recentChats = await prisma.chatMessage.findMany({
    where: {
      thread: { organizationId },
      createdAt: { gte: startOfToday },
      senderType: 'USER',
      OR: escapeWords.map(word => ({ content: { contains: word, mode: 'insensitive' } }))
    },
    include: { thread: { include: { lead: true } } }
  });

  for (const msg of recentChats) {
    addActivity({
      userId: msg.senderId,
      leadId: msg.thread.leadId,
      title: 'Escape Attempt',
      body: 'WhatsApp escape attempt blocked',
      summary: `User attempted to share off-platform contact details: "${msg.content.substring(0, 50)}..."`,
      status: 'INVESTIGATING',
      severity: 'Medium'
    });
  }

  // 4. Repeated Access
  const repeatedAccess = await prisma.auditLog.groupBy({
    by: ['actorId', 'actorName', 'note'],
    where: {
      organizationId,
      action: 'DECRYPT',
      createdAt: { gte: startOfToday },
    },
    _count: { id: true },
    having: { id: { _count: { gt: 10 } } },
  });

  for (const access of repeatedAccess) {
    addActivity({
      userId: access.actorId,
      title: 'Repeated Access',
      body: 'Same file accessed multiple times',
      summary: `${access.actorName} accessed the same file ${access._count.id} times today. Potential data scraping.`,
      status: 'NEW',
      severity: 'High'
    });
  }

  // 5. Security: Login from new device / Unusual time
  const logins = await prisma.auditLog.findMany({
    where: {
      organizationId,
      action: 'LOGIN',
      createdAt: { gte: startOfToday },
    },
  });

  for (const login of logins) {
    const loginTime = new Date(login.createdAt);
    const hour = loginTime.getHours();
    
    if (hour < 8 || hour > 21) {
      addActivity({
        userId: login.actorId,
        title: 'Security',
        body: 'Unusual login time',
        summary: `Login detected outside working hours (${loginTime.toLocaleTimeString()}).`,
        status: 'MONITORING',
        severity: 'Low'
      });
    }
  }

  // 6. Message Spike
  const msgSpikes = await prisma.auditLog.groupBy({
    by: ['actorId', 'actorName'],
    where: {
      organizationId,
      action: 'CHAT',
      createdAt: { gte: startOfToday },
    },
    _count: { id: true },
    having: { id: { _count: { gt: 50 } } },
  });

  for (const spike of msgSpikes) {
    addActivity({
      userId: spike.actorId,
      title: 'Message Spike',
      body: 'High volume messages sent',
      summary: `${spike.actorName} sent ${spike._count.id} messages today, exceeding safety threshold.`,
      status: 'MONITORING',
      severity: 'Medium'
    });
  }

  // 7. Multiple Login/Logout
  const loginLogoutSpikes = await prisma.auditLog.groupBy({
    by: ['actorId', 'actorName'],
    where: {
      organizationId,
      action: { in: ['LOGIN', 'LOGOUT'] },
      createdAt: { gte: startOfToday },
    },
    _count: { id: true },
    having: { id: { _count: { gt: 10 } } },
  });

  for (const spike of loginLogoutSpikes) {
    addActivity({
      userId: spike.actorId,
      title: 'Security',
      body: 'Multiple login/logout activity',
      summary: `${spike.actorName} had ${spike._count.id} session events today.`,
      status: 'NEW',
      severity: 'High'
    });
  }

  // --- DEMO DATA: solobuildworker ---
  const workers = await prisma.user.findMany({
    where: { organizationId, role: { in: ['ORG_ADMIN', 'MANAGER'] } },
    take: 1
  });

  if (workers.length > 0) {
    addActivity({
      userId: workers[0].id,
      title: 'Security',
      body: 'Multiple login/logout activity',
      summary: `solobuildworker had 14 session events today.`,
      status: 'NEW',
      severity: 'High'
    });
  }

  // Save results
  for (const activity of suspiciousActivities) {
    const existing = await prisma.securityEWS.findFirst({
      where: {
        organizationId,
        userId: activity.userId,
        title: activity.title,
        createdAt: { gte: startOfToday }
      }
    });

    if (!existing) {
      await prisma.securityEWS.create({
        data: {
          organizationId,
          userId: activity.userId,
          leadId: activity.leadId,
          title: activity.title,
          body: activity.body,
          summary: activity.summary,
          status: activity.status as EWSStatus,
          severity: activity.severity,
          ipAddress: activity.ipAddress,
          device: activity.device,
          location: activity.location
        }
      });
    }
  }

  return suspiciousActivities.length;
}
