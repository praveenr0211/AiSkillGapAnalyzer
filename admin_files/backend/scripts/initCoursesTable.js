const dbAsync = require("./config/database");

async function initCoursesTable() {
  try {
    console.log("🔧 Initializing Courses table...");

    // Check if we're using PostgreSQL or SQLite
    const usePostgres = process.env.DATABASE_URL ? true : false;

    if (usePostgres) {
      // PostgreSQL schema
      await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS courses (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          stream VARCHAR(100) NOT NULL,
          url TEXT NOT NULL,
          icon VARCHAR(50) DEFAULT '📚',
          lessons INTEGER DEFAULT 0,
          hours DECIMAL(5, 2) DEFAULT 0,
          color VARCHAR(20) DEFAULT '#667eea',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      // SQLite schema
      await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          stream TEXT NOT NULL,
          url TEXT NOT NULL,
          icon TEXT DEFAULT '📚',
          lessons INTEGER DEFAULT 0,
          hours REAL DEFAULT 0,
          color TEXT DEFAULT '#667eea',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    console.log("✅ Courses table created successfully");
    console.log("🎉 Courses table initialization complete!");
  } catch (error) {
    console.error("❌ Error initializing courses table:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initCoursesTable()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initCoursesTable;
