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
  console.log("🌱 Seeding Tenants and Users...");
  console.log("⏰ Current time: 08:16 PM IST, July 29, 2025");

  if (!(await testDatabaseConnection())) {
    console.error("❌ Aborting seed due to database connection failure. Check DATABASE_URL in .env.");
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    // ---- Create Tenants ----
    const tenants = await Promise.all(
      ['Company A', 'Company B', 'Company C'].map(name =>
        prisma.tenants.upsert({
          where: { name },
          update: {},
          create: {
            name,
            plan: name === 'Company B' ? 'Pro' : 'Starter',
            status: 'ACTIVE',
            timezone: 'Asia/Kolkata',
            locale: 'en-IN'
          }
        })
      )
    );
    console.log(`✅ Created/Updated ${tenants.length} tenants:`, tenants.map(t => t.name));

    // ---- Create Roles ----
    const roles = await Promise.all(
      tenants.map(tenant =>
        prisma.roles.upsert({
          where: {
            tenant_id_name: { tenant_id: tenant.id, name: 'Admin' }
          },
          update: {},
          create: {
            tenant_id: tenant.id,
            name: 'Admin',
            access_level: 'FULL',
            permissions: { dashboard: true, manageUsers: true }
          }
        }).catch(e => {
          console.error(`❌ Error creating role for tenant ${tenant.id}:`, e);
          throw e;
        })
      )
    );
    console.log(`✅ Created/Updated ${roles.length} roles`);

    // ---- Create Users ----
    const users = await Promise.all(
      tenants.map((tenant, i) =>
        prisma.users.upsert({
          where: { email: `admin${i + 1}@${tenant.name.toLowerCase()}.com` },
          update: {},
          create: {
            tenant_id: tenant.id,
            email: `admin${i + 1}@${tenant.name.toLowerCase()}.com`,
            name: `Admin ${tenant.name}`,
            password_hash: 'hashedpassword123',
            role_id: roles[i].id,
            status: 'ACTIVE'
          }
        }).catch(e => {
          console.error(`❌ Error creating user ${i + 1}:`, e);
          throw e;
        })
      )
    );
    console.log(`✅ Created/Updated ${users.length} users`);

    console.log("🎉 Tenants and Users Seeding Completed Successfully!");
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