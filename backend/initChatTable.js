require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const db = require("./config/database");

/**
 * Initialize chat tables in database
 */
async function initChatTables() {
  console.log("🔧 Initializing chat tables...");

  try {
    const usePostgres = process.env.DATABASE_URL ? true : false;

    // Create chat_sessions table
    if (usePostgres) {
      // Drop existing table if it exists
      await db.run(`DROP TABLE IF EXISTS chat_messages CASCADE`);
      await db.run(`DROP TABLE IF EXISTS chat_sessions CASCADE`);

      await db.run(`
        CREATE TABLE chat_sessions (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          analysis_id INTEGER,
          context_data TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ chat_sessions table created (PostgreSQL)");
    } else {
      await db.run(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          analysis_id INTEGER,
          context_data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ chat_sessions table created (SQLite)");
    }

    // Create chat_messages table
    if (usePostgres) {
      await db.run(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
          message TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
        )
      `);
      console.log("✅ chat_messages table created (PostgreSQL)");
    } else {
      await db.run(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
          message TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
        )
      `);
      console.log("✅ chat_messages table created (SQLite)");
    }

    // Create index for faster queries
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id 
      ON chat_sessions(user_id)
    `);

    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id 
      ON chat_messages(session_id)
    `);

    console.log("✅ Indexes created successfully");
    console.log("🎉 Chat tables initialization complete");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating chat tables:", err);
    process.exit(1);
  }
}

// Run initialization
initChatTables();
