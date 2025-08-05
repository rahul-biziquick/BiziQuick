/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "contacts_tenant_id_idx";

-- DropIndex
DROP INDEX "invoices_tenant_id_idx";

-- DropIndex
DROP INDEX "leads_tenant_id_idx";

-- DropIndex
DROP INDEX "opportunities_tenant_id_idx";

-- DropIndex
DROP INDEX "quotes_tenant_id_idx";

-- CreateIndex
CREATE INDEX "contacts_tenant_id_lead_id_idx" ON "contacts"("tenant_id", "lead_id");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_quote_id_idx" ON "invoices"("tenant_id", "quote_id");

-- CreateIndex
CREATE INDEX "leads_tenant_id_name_idx" ON "leads"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_contact_id_idx" ON "opportunities"("tenant_id", "contact_id");

-- CreateIndex
CREATE INDEX "platform_roles_name_idx" ON "platform_roles"("name");

-- CreateIndex
CREATE INDEX "quotes_tenant_id_opportunity_id_idx" ON "quotes"("tenant_id", "opportunity_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_name_key" ON "roles"("tenant_id", "name");
