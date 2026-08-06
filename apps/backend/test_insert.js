const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Hms@techhansa@localhost:5432/hms_database' });

async function run() {
  try {
    const res = await pool.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'user_role';");
    console.log("ROLES:", res.rows);
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await pool.end();
  }
}

run();
