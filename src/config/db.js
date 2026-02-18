const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const connectDB = async (retries = 15) => {
  while (retries > 0) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Connected to PostgreSQL");
      return;
    } catch (error) {
      console.log(`⏳ PostgreSQL not ready. Retries left: ${retries - 1}`);
      retries -= 1;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  throw new Error("❌ Unable to connect to PostgreSQL after multiple retries");
};


module.exports = { pool, connectDB };
