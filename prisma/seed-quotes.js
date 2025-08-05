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
  console.log("🌱 Seeding Quotes...");
  console.log("⏰ Current time: 08:16 PM IST, July 29, 2025");

  if (!(await testDatabaseConnection())) {
    console.error("❌ Aborting seed due to database connection failure. Check DATABASE_URL in .env.");
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    const opportunities = await prisma.opportunities.findMany();

    for (const opp of opportunities) {
      let quote = await prisma.quotes.findFirst({
        where: {
          tenant_id: opp.tenant_id,
          opportunity_id: opp.id
        }
      });
      if (!quote) {
        quote = await prisma.quotes.create({
          data: {
            tenant_id: opp.tenant_id,
            opportunity_id: opp.id,
            quote_pdf_url: 'https://example.com/quote.pdf',
            status: 'DRAFT'
          }
        });
      }
      console.log(`✅ Created/Updated quote for opportunity ${opp.id}`);
    }
    console.log("🎉 Quotes Seeding Completed Successfully!");
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