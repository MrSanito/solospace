import { prisma } from "./prisma";

export async function checkLoginSpike(userId: string, organizationId: string, currentIp?: string, currentUserAgent?: string) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  // Fetch LOGIN or LOGOUT actions for this user in the last 30 minutes
  const recentLogs = await prisma.auditLog.findMany({
    where: {
      actorId: userId,
      action: {
        in: ["LOGIN", "LOGOUT", "FAILED_LOGIN"]
      },
      createdAt: {
        gte: thirtyMinutesAgo
      }
    }
  });

  const activityCount = recentLogs.length;

  // Extract unique IPs and Devices from JSON notes
  const ips = new Set<string>();
  const devices = new Set<string>();
  
  if (currentIp) ips.add(currentIp);
  if (currentUserAgent) devices.add(currentUserAgent);

  recentLogs.forEach(log => {
    try {
      if (log.note && log.note.startsWith("{")) {
        const parsed = JSON.parse(log.note);
        if (parsed.ip) ips.add(parsed.ip);
        if (parsed.device) devices.add(parsed.device);
      }
    } catch (e) {
      // Ignore parse errors
    }
  });

  const uniqueIpsCount = ips.size;
  const uniqueDevicesCount = devices.size;

  // Trigger if 3+ events OR 2+ unique IPs/Devices in 30 mins
  if (activityCount >= 3 || uniqueIpsCount > 1 || uniqueDevicesCount > 1) {
    const ipList = Array.from(ips).join(", ");
    const deviceList = Array.from(devices).join(" | ");

    let title = "Login/Logout Frequency Spike";
    let severity: "Low" | "Medium" | "High" | "Critical" = "High";

    if (uniqueIpsCount > 1 || uniqueDevicesCount > 1) {
      title = "Multi-Source Authentication Alert";
      severity = "Critical";
    }

    const body = `Activity detected: ${activityCount} events from ${uniqueIpsCount} IP(s) and ${uniqueDevicesCount} device(s) in 30 minutes. 
IPs: [${ipList}]
Devices: [${deviceList}]`;

    const summary = uniqueIpsCount > 1 
      ? "CRITICAL: Multiple IP addresses detected for a single user session window. This is a high-confidence indicator of credential sharing or session hijacking."
      : "Frequent login/logout events detected. While potentially harmless, it may indicate automated scraping or session stability issues.";

    await prisma.securityEWS.create({
      data: {
        organizationId,
        userId,
        title,
        body,
        summary,
        severity,
        status: "NEW"
      }
    }).catch(err => console.error("Failed to create EWS alert:", err));
  }
}

export async function checkFileAccessSpike(userId: string, organizationId: string, note: string, currentIp?: string, currentUserAgent?: string) {
  if (!note) return;
  
  let fileName = "";
  if (note.includes("downloaded file:")) {
    fileName = note.split("downloaded file: ")[1];
  } else if (note.includes("Unlocked file:")) {
    fileName = note.split("Unlocked file: ")[1];
  }
  
  if (!fileName) return;

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  const recentLogs = await prisma.auditLog.findMany({
    where: {
      actorId: userId,
      action: {
        in: ["DOWNLOAD", "DECRYPT"]
      },
      note: {
        contains: fileName
      },
      createdAt: {
        gte: thirtyMinutesAgo
      }
    }
  });

  const accessCount = recentLogs.length;

  const ips = new Set<string>();
  const devices = new Set<string>();
  if (currentIp) ips.add(currentIp);
  if (currentUserAgent) devices.add(currentUserAgent);

  recentLogs.forEach(log => {
    try {
      if (log.note && log.note.startsWith("{")) {
        const parsed = JSON.parse(log.note);
        if (parsed.ip) ips.add(parsed.ip);
        if (parsed.device) devices.add(parsed.device);
      }
    } catch (e) {}
  });

  if (accessCount >= 3 || ips.size > 1) {
    const severity = ips.size > 1 ? "High" : "Medium";
    
    await prisma.securityEWS.create({
      data: {
        organizationId,
        userId,
        title: "Repeated File Access",
        body: `User accessed file "${fileName}" ${accessCount} times from ${ips.size} IP(s) and ${devices.size} device(s) in 30 minutes.
IPs: [${Array.from(ips).join(", ")}]`,
        summary: ips.size > 1 
          ? `CRITICAL: The file "${fileName}" is being accessed from multiple IP addresses simultaneously.`
          : `Frequent access to the same sensitive file "${fileName}" detected.`,
        severity,
        status: "NEW"
      }
    });
  }
}
