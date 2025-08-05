const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CRM database seeding...");

  // 1. Create Platform Role & Admin
  const platformRole = await prisma.platform_roles.create({
    data: { name: "Platform Admin", permissions: { modules: ["ALL"] } }
  });

  const platformAdmin = await prisma.users.create({
    data: {
      email: "admin@platform.com",
      name: "Platform Admin",
      password_hash: "hashedpassword",
      status: "ACTIVE",
      role_id: null, // platform roles handled separately
      tenant_id: "00000000-0000-0000-0000-000000000000" // placeholder for platform
    }
  });

  await prisma.audit_logs.create({
    data: {
      tenant_id: platformAdmin.tenant_id,
      user_id: platformAdmin.id,
      entity_type: "USER",
      entity_id: platformAdmin.id,
      action: "CREATE_PLATFORM_ADMIN",
      new_values: { email: platformAdmin.email },
      action_timestamp: new Date(),
      ip_address: "127.0.0.1",
      user_agent: "SeederScript/1.0"
    }
  });

  // 2. Create Tenant
  const tenant = await prisma.tenants.create({
    data: {
      name: "Acme Corp",
      plan: "Pro",
      status: "ACTIVE",
      created_by: platformAdmin.id
    }
  });

  // 3. Tenant Role & Admin User
  const tenantAdminRole = await prisma.roles.create({
    data: {
      tenant_id: tenant.id,
      name: "Tenant Admin",
      access_level: "FULL",
      data_scope: "ALL",
      permissions: { modules: ["LEADS", "QUOTES", "INVOICES"] }
    }
  });

  const tenantAdmin = await prisma.users.create({
    data: {
      email: "admin@acme.com",
      name: "John Tenant",
      password_hash: "hashedpassword",
      status: "ACTIVE",
      tenant_id: tenant.id,
      role_id: tenantAdminRole.id
    }
  });

  await prisma.audit_logs.create({
    data: {
      tenant_id: tenant.id,
      user_id: tenantAdmin.id,
      entity_type: "USER",
      entity_id: tenantAdmin.id,
      action: "CREATE_TENANT_ADMIN",
      new_values: { email: tenantAdmin.email },
      action_timestamp: new Date()
    }
  });

  // 4. Subscription
  await prisma.subscriptions.create({
    data: {
      tenant_id: tenant.id,
      plan: "Pro",
      status: "ACTIVE",
      start_date: new Date(),
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }
  });

  // 5. Create a Lead
  const lead = await prisma.leads.create({
    data: {
      tenant_id: tenant.id,
      name: "Big Client Ltd",
      email: "contact@bigclient.com",
      phone: "+1234567890",
      status: "NEW",
      created_by: tenantAdmin.id
    }
  });

  // 6. Add Contact for Lead
  const contact = await prisma.contacts.create({
    data: {
      tenant_id: tenant.id,
      lead_id: lead.id,
      name: "Jane Doe",
      email: "jane@bigclient.com",
      phone: "+1234567890",
      designation: "Decision Maker"
    }
  });

  // 7. Create Opportunity
  const opportunity = await prisma.opportunities.create({
    data: {
      tenant_id: tenant.id,
      contact_id: contact.id,
      stage: "Prospect",
      value: 50000
    }
  });

  // 8. Create Quote
  const quote = await prisma.quotes.create({
    data: {
      tenant_id: tenant.id,
      opportunity_id: opportunity.id,
      quote_pdf_url: "https://example.com/quote1.pdf",
      status: "SENT"
    }
  });

  // 9. Create Invoice
  const invoice = await prisma.invoices.create({
    data: {
      tenant_id: tenant.id,
      quote_id: quote.id,
      invoice_number: "INV-1001",
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: "UNPAID"
    }
  });

  // 10. Add Activity & Audit Log
  await prisma.activities.create({
    data: {
      tenant_id: tenant.id,
      entity_type: "LEAD",
      entity_id: lead.id,
      type: "CALL",
      content: "Initial follow-up call with client",
      timestamp: new Date(),
      created_by: tenantAdmin.id
    }
  });

  await prisma.audit_logs.create({
    data: {
      tenant_id: tenant.id,
      user_id: tenantAdmin.id,
      entity_type: "LEAD",
      entity_id: lead.id,
      action: "CREATE_LEAD",
      new_values: { name: lead.name, email: lead.email },
      action_timestamp: new Date()
    }
  });

  console.log("✅ CRM seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
