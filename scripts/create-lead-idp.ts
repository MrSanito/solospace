import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "vishal@gmail.com";
  
  // Find the lead
  const lead = await prisma.lead.findFirst({
    where: { email: email }
  });

  if (!lead) {
    console.error(`Lead with email ${email} not found.`);
    // If not found, let's create a dummy lead just for testing
    console.log("Creating a dummy lead for testing...");
    const org = await prisma.organization.findFirst();
    const user = await prisma.user.findFirst();
    
    if (!org || !user) {
        console.error("No organization or user found to create a lead.");
        return;
    }

    const newLead = await prisma.lead.create({
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
    console.log(`Created dummy lead: ${newLead.id}`);
    await createPortalAccount(newLead.id, email);
  } else {
    console.log(`Found lead: ${lead.id}`);
    await createPortalAccount(lead.id, email);
  }
}

async function createPortalAccount(leadId: string, email: string) {
  const username = email;
  const password = "portal123"; // Simple password for testing
  
  // In a real app, we'd hash the password
  const account = await prisma.leadPortalAccount.upsert({
    where: { leadId: leadId },
    update: {
      username: username,
      passwordHash: password, // Store as plain text for this test as requested
    },
    create: {
      leadId: leadId,
      username: username,
      passwordHash: password,
    }
  });

  console.log(`Lead Portal Account (IDP) created/updated for ${email}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
