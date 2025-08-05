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
  console.log("🌱 Seeding Invoices...");
  console.log("⏰ Current time: 08:16 PM IST, July 29, 2025");

  if (!(await testDatabaseConnection())) {
    console.error("❌ Aborting seed due to database connection failure. Check DATABASE_URL in .env.");
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    const quotes = await prisma.quotes.findMany();

    for (const quote of quotes) {
      let invoice = await prisma.invoices.findFirst({
        where: {
          tenant_id: quote.tenant_id,
          quote_id: quote.id
        }
      });
      if (!invoice) {
        invoice = await prisma.invoices.create({
          data: {
            tenant_id: quote.tenant_id,
            quote_id: quote.id,
            invoice_number: `INV-${Math.floor(Math.random() * 1000)}`,
            due_date: new Date(Date.now() + 14 * 86400000),
            status: 'PENDING'
          }
        });
      }
      console.log(`✅ Created/Updated invoice for quote ${quote.id}`);
    }
    console.log("🎉 Invoices Seeding Completed Successfully!");
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