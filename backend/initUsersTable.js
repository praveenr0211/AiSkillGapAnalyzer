require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const dbAsync = require("./config/database");

async function initUsersTable() {
  try {
    console.log("🔧 Creating users table...");

    const usePostgres = process.env.DATABASE_URL ? true : false;

    if (usePostgres) {
      // PostgreSQL schema
      await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          google_id VARCHAR(255) UNIQUE,
          email VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          profile_picture TEXT,
          login_count INTEGER DEFAULT 1,
          last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      // SQLite schema
      await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          google_id TEXT UNIQUE,
          email TEXT NOT NULL,
          name TEXT,
          profile_picture TEXT,
          login_count INTEGER DEFAULT 1,
          last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    console.log("✅ Users table created successfully");
    console.log("🎉 Users table initialization complete!");
  } catch (error) {
    console.error("❌ Error initializing users table:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initUsersTable()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initUsersTable;
