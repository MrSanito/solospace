import { prisma } from "@/lib/prisma";

async function main() {
  try {
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Users:", users.map(u => u.email));
    
    const leads = await prisma.lead.findMany({ take: 5 });
    console.log("Leads:", leads.map(l => ({ email: l.email, email2: l.email2 })));
  } catch (err) {
    console.error("DB check failed:", err);
  }
}

main();
