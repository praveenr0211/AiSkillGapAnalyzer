const { Pool } = require("pg");
require("dotenv").config();

async function createVideosTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("🔧 Creating videos table in PostgreSQL...");

    await pool.query(`
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

    console.log("✅ Videos table created successfully!");

    // Check if table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'videos'
      )
    `);

    console.log(
      "✅ Verification:",
      result.rows[0].exists ? "Videos table exists" : "Videos table NOT found"
    );

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating videos table:", error);
    await pool.end();
    process.exit(1);
  }
}

createVideosTable();
