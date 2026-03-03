require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { Pool } = require("pg");

/**
 * Initialize courses and videos tables directly via single connection
 */
async function initCoursesAndVideos() {
  console.log("🔧 Initializing Courses and Videos tables...\n");

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL not set. Using SQLite would be handled by other scripts.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    max: 1, // Use single connection to avoid pool issues
  });

  try {
    const client = await pool.connect();
    console.log("✅ Connected to Neon PostgreSQL\n");

    // Create courses table
    console.log("📝 Creating courses table...");
    await client.query(`
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
    console.log("✅ Courses table created\n");

    // Create videos table
    console.log("📝 Creating videos table...");
    await client.query(`
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
    console.log("✅ Videos table created\n");

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('courses', 'videos')
      ORDER BY table_name
    `);

    console.log("📊 Verified tables:");
    result.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    client.release();
    await pool.end();

    console.log("\n🎉 Courses and Videos tables initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    await pool.end();
    process.exit(1);
  }
}

initCoursesAndVideos();
