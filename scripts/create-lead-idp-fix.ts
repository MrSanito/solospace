import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL || "";

const pool = new pg.Pool({ 
  connectionString,
  max: 3,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const email = "vishal@gmail.com";
  
  console.log(`Searching for lead with email: ${email}...`);

  try {
    let lead = await prisma.lead.findFirst({
      where: { email: email }
    });

    if (!lead) {
      console.log(`Lead with email ${email} not found. Creating dummy lead...`);
      const org = await prisma.organization.findFirst();
      const user = await prisma.user.findFirst();
      
      if (!org || !user) {
          throw new Error("No organization or user found to create a lead.");
      }

      lead = await prisma.lead.create({
          data: {
              contactName: "Vishal Test",
              company: "Test Corp",
              email: email,
              phone: "+91 9876543210",
              organizationId: org.id,
              ownerId: user.id,
              createdById: user.id,
              project: "Space Chat Test",
          }
      });
      console.log(`Created dummy lead: ${lead.id}`);
    } else {
      console.log(`Found existing lead: ${lead.id}`);
    }

    const username = email;
    const password = "portal123";
    
    await prisma.leadPortalAccount.upsert({
      where: { leadId: lead.id },
      update: {
        username: username,
        passwordHash: password,
      },
      create: {
        leadId: lead.id,
        username: username,
        passwordHash: password,
      }
    });

    console.log(`\nSUCCESS!`);
    console.log(`-----------------------------------`);
    console.log(`Lead Portal Account (IDP) created:`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`-----------------------------------`);

  } catch (error) {
    console.error("Error during execution:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
