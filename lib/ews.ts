import { prisma } from "./prisma";

export async function checkLoginSpike(userId: string, organizationId: string) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  // Check count of LOGIN or LOGOUT actions
  const activityCount = await prisma.auditLog.count({
    where: {
      actorId: userId,
      action: {
        in: ["LOGIN", "LOGOUT"]
      },
      createdAt: {
        gte: thirtyMinutesAgo
      }
    }
  });

  if (activityCount >= 3) {
    // Create EWS Alert
    await prisma.securityEWS.upsert({
      where: {
        // We might want to avoid duplicate alerts for the same window, but since we don't have a unique key for "session spike", we just create a new one or find existing NEW one
        id: "placeholder-non-existent" 
      },
      create: {
        organizationId,
        userId,
        title: "Login/Logout Frequency Spike",
        body: `User has ${activityCount} login/logout events in the last 30 minutes.`,
        summary: "Multiple login or logout sessions detected in a short window. This may indicate credential sharing, session hijacking, or suspicious user behavior.",
        severity: "High",
        status: "NEW"
      },
      update: {}
    }).catch(async () => {
      // If upsert fails (it will since id won't match), just create
      await prisma.securityEWS.create({
        data: {
          organizationId,
          userId,
          title: "Login/Logout Frequency Spike",
          body: `User has ${activityCount} login/logout events in the last 30 minutes.`,
          summary: "Multiple login or logout sessions detected in a short window. This may indicate credential sharing, session hijacking, or suspicious user behavior.",
          severity: "High",
          status: "NEW"
        }
      });
    });
  }
}

export async function checkFileAccessSpike(userId: string, organizationId: string, note: string) {
  if (!note) return;
  
  let fileName = "";
  if (note.includes("downloaded file:")) {
    fileName = note.split("downloaded file: ")[1];
  } else if (note.includes("Unlocked file:")) {
    fileName = note.split("Unlocked file: ")[1];
  }
  
  if (!fileName) return;

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  const accessCount = await prisma.auditLog.count({
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

  if (accessCount >= 3) {
    await prisma.securityEWS.create({
      data: {
        organizationId,
        userId,
        title: "Repeated File Access",
        body: `User accessed file "${fileName}" ${accessCount} times in the last 30 minutes.`,
        summary: `Frequent access to the same sensitive file "${fileName}" detected. This could be a sign of unauthorized data harvesting or technical issues resulting in repeated downloads/decryptions.`,
        severity: "Medium",
        status: "NEW"
      }
    });
  }
}
