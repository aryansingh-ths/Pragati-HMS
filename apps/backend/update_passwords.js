require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

pool.query("UPDATE users SET password_hash = '$2b$10$HYQ.4upV6kG1eScYuI37LuMCNiu4JrV8CQpc/46JpsL2rDWvMv/Am'")
  .then(() => {
    console.log("Passwords updated");
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
