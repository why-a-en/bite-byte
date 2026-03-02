-- Enable RLS on all tenant-scoped tables
-- FORCE ROW LEVEL SECURITY is critical: without it, the table owner (Prisma DB user) bypasses RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues FORCE ROW LEVEL SECURITY;

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories FORCE ROW LEVEL SECURITY;

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items FORCE ROW LEVEL SECURITY;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;

-- RLS policies: current_setting reads the transaction-local app.tenant_id set by Prisma extension
-- 'true' as second arg to current_setting means return NULL if missing (safe — policy evaluates to false = deny)
CREATE POLICY tenant_isolation_policy ON venues
  USING (id::text = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_policy ON menu_categories
  USING (venue_id::text = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_policy ON menu_items
  USING (venue_id::text = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_policy ON orders
  USING (venue_id::text = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_policy ON order_items
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE venue_id::text = current_setting('app.tenant_id', true)
    )
  );
