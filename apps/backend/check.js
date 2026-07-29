const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Hms@techhansa@192.168.1.5:5432/hms_database'
});
async function test() {
  try {
    const execUserCheck = await pool.query("SELECT * FROM users WHERE email = 'exec@techhansa.com'");
    console.log('exec@techhansa.com exists:', execUserCheck.rows.length > 0);
  } catch(e) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}
test();
