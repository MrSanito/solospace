const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "vishal@gmail.com";
  
  console.log(`Starting process for ${email}...`);

  try {
    // Find the lead
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
              project: "Test Space Project",
          }
      });
      console.log(`Created dummy lead: ${lead.id}`);
    } else {
      console.log(`Found existing lead: ${lead.id}`);
    }

    const username = email;
    const password = "portal123";
    
    const account = await prisma.leadPortalAccount.upsert({
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
    console.log(`Lead Portal Account (IDP) ready for testing:`);
    console.log(`URL: /leadlogin`);
    console.log(`Email/Username: ${username}`);
    console.log(`Portal Key: ${password}`);

  } catch (error) {
    console.error("Error during execution:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
