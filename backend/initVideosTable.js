const dbAsync = require("./config/database");

async function initVideosTable() {
  try {
    console.log("🔧 Initializing Videos table...");

    // Check if we're using PostgreSQL or SQLite
    const usePostgres = process.env.DATABASE_URL ? true : false;

    if (usePostgres) {
      // PostgreSQL schema
      await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS videos (
          id SERIAL PRIMARY KEY,
          course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          duration VARCHAR(20) DEFAULT '0:00',
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      // SQLite schema
      await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS videos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          course_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          duration TEXT DEFAULT '0:00',
          order_index INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        )
      `);
    }

    console.log("✅ Videos table created successfully");
    console.log("🎉 Videos table initialization complete!");
  } catch (error) {
    console.error("❌ Error initializing videos table:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initVideosTable()
    .then(() => {
      console.log("✅ Database initialization complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Database initialization failed:", error);
      process.exit(1);
    });
}

module.exports = initVideosTable;
