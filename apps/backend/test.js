const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Hms@techhansa@192.168.1.5:5432/hms_database'
});
async function test() {
  try {
    await pool.query(`
      ALTER TABLE sales_leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE sales_leads ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'Rooms';
      ALTER TABLE sales_accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE sales_tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
    `);
    console.log('ALTER success');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sales_leads_stage ON sales_leads(stage) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_sales_leads_assigned ON sales_leads(assigned_to) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_sales_leads_company ON sales_leads(company);
      CREATE INDEX IF NOT EXISTS idx_sales_tasks_deadline ON sales_tasks(deadline) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_sales_accounts_assigned ON sales_accounts(assigned_to) WHERE deleted_at IS NULL;
    `);
    console.log('INDEX success');

    const execUserCheck = await pool.query("SELECT * FROM users WHERE email = 'exec@techhansa.com'");
    console.log('exec@techhansa.com exists:', execUserCheck.rows.length > 0);
  } catch(e) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}
test();
