require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const db = require("./config/database");

console.log("🔧 Creating skill_progress table...");

async function initProgressTables() {
  try {
    // Create skill_progress table
    await db.run(`
      CREATE TABLE IF NOT EXISTS skill_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        status TEXT DEFAULT 'in-progress',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        notes TEXT,
        UNIQUE(user_id, skill_name)
      )
    `);

    console.log("✅ skill_progress table created successfully");

    // Create achievements table
    await db.run(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        badge_type TEXT NOT NULL,
        badge_name TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_type)
      )
    `);

    console.log("✅ achievements table created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
}

initProgressTables();
