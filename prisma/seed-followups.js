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
  console.log("🌱 Seeding Follow-Ups...");
  console.log("⏰ Current time: 12:35 PM IST, July 30, 2025");

  if (!(await testDatabaseConnection())) {
    console.error("❌ Aborting seed due to database connection failure. Check DATABASE_URL in .env.");
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    const leads = await prisma.leads.findMany();
    const opportunities = await prisma.opportunities.findMany();

    const followups = [];
    for (let i = 0; i < leads.length; i++) {
      let followup = await prisma.followups.findFirst({
        where: {
          lead_id: leads[i].id
        }
      });
      if (!followup) {
        followup = await prisma.followups.create({
          data: {
            lead_id: leads[i].id,
            tenant_id: leads[i].tenant_id,
            action: `Follow up with ${leads[i].name} on lead status`,
            due_date: new Date(Date.now() + 7 * 86400000), // 7 days from now
            status: 'PENDING',
            assigned_to: (await prisma.users.findFirst({ where: { tenant_id: leads[i].tenant_id } }))?.id
          }
        });
      }
      followups.push(followup);
    }

    for (let i = 0; i < opportunities.length; i++) {
      let followup = await prisma.followups.findFirst({
        where: {
          opportunity_id: opportunities[i].id
        }
      });
      if (!followup) {
        followup = await prisma.followups.create({
          data: {
            opportunity_id: opportunities[i].id,
            tenant_id: opportunities[i].tenant_id,
            action: `Follow up on opportunity ${opportunities[i].id} progress`,
            due_date: new Date(Date.now() + 10 * 86400000), // 10 days from now
            status: 'PENDING',
            assigned_to: (await prisma.users.findFirst({ where: { tenant_id: opportunities[i].tenant_id } }))?.id
          }
        });
      }
      followups.push(followup);
    }

    console.log(`✅ Created/Updated ${followups.length} follow-ups`);
    console.log("🎉 Follow-Ups Seeding Completed Successfully!");
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