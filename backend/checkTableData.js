require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { Pool } = require("pg");

/**
 * Check which tables have data and which are empty
 */
async function checkTables() {
  console.log("🔍 Checking table data in Neon PostgreSQL...\n");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  try {
    const client = await pool.connect();

    const tables = [
      "users",
      "job_skills",
      "resume_analyses",
      "skill_progress",
      "chat_sessions",
      "chat_messages",
      "admins",
      "courses",
      "videos",
    ];

    console.log("📊 Table Status:\n");

    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      const status = count > 0 ? "✅" : "⚠️ ";
      console.log(`${status} ${table.padEnd(20)} ${count} rows`);
    }

    console.log("\n📝 Legend:");
    console.log("✅ = Has data");
    console.log("⚠️  = Empty (may need seed data)\n");

    client.release();
    await pool.end();

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    await pool.end();
    process.exit(1);
  }
}

checkTables();
