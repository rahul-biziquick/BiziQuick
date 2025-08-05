const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");
    return true;
  } catch (e) {
    console.error("❌ Database connection failed:", e.message);
    return false;
  }
}

async function main() {
  console.log("🌱 Seeding Opportunities...");
  console.log("⏰ Current time: 08:16 PM IST, July 29, 2025");

  if (!(await testDatabaseConnection())) {
    console.error("❌ Aborting seed due to database connection failure. Check DATABASE_URL in .env.");
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    const leads = await prisma.leads.findMany();
    const contacts = await prisma.contacts.findMany();

    const opportunities = await Promise.all(
      leads.slice(0, 3).map(async (lead) => {
        const contact = contacts.find(c => c.lead_id === lead.id);
        if (!contact) throw new Error(`No contact found for lead ${lead.id}`);
        let opportunity = await prisma.opportunities.findFirst({
          where: {
            tenant_id: lead.tenant_id,
            contact_id: contact.id
          }
        });
        if (!opportunity) {
          opportunity = await prisma.opportunities.create({
            data: {
              tenant_id: lead.tenant_id,
              contact_id: contact.id,
              stage: 'Prospecting',
              value: 10000.00
            }
          });
        }
        return opportunity;
      })
    );
    console.log(`✅ Created/Updated ${opportunities.length} opportunities`);

    console.log("🎉 Opportunities Seeding Completed Successfully!");
  } catch (e) {
    console.error("❌ Seed error:", {
      message: e.message,
      code: e.code,
      stack: e.stack
    });
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(async (e) => {
    console.error("❌ Seed error:", {
      message: e.message,
      code: e.code,
      stack: e.stack
    });
    await prisma.$disconnect();
    process.exit(1);
  });