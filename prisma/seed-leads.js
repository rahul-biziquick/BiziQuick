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
  console.log("🌱 Seeding Leads...");
  console.log("⏰ Current time: 08:16 PM IST, July 29, 2025");

  if (!(await testDatabaseConnection())) {
    console.error("❌ Aborting seed due to database connection failure. Check DATABASE_URL in .env.");
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    const tenants = await prisma.tenants.findMany();
    const users = await prisma.users.findMany();

    const leads = [];
    for (let i = 0; i < tenants.length; i++) {
      for (let j = 1; j <= 2; j++) {
        const leadName = `Lead ${j} - ${tenants[i].name}`;
        let lead = await prisma.leads.findFirst({
          where: {
            tenant_id: tenants[i].id,
            name: leadName
          }
        });
        if (!lead) {
          lead = await prisma.leads.create({
            data: {
              tenant_id: tenants[i].id,
              name: leadName,
              email: `lead${j}@${tenants[i].name.toLowerCase().replace(' ', '')}.com`,
              phone: `999${j}${i}0000`,
              source: j % 2 === 0 ? 'Website' : 'Referral',
              created_by: users[i].id,
              status: 'NEW'
            }
          });
        }
        leads.push(lead);
      }
    }
    console.log(`✅ Created/Updated ${leads.length} leads`);

    console.log("🎉 Leads Seeding Completed Successfully!");
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