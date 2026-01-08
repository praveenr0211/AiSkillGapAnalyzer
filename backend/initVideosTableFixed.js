const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Pool } = require("pg");

async function initVideosTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("🔧 Creating videos table in PostgreSQL...");
    console.log(
      "📊 Using DATABASE_URL:",
      process.env.DATABASE_URL ? "Set" : "Not set"
    );

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

    // Verify table exists
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

    // Show existing courses
    const coursesResult = await pool.query(
      "SELECT id, title FROM courses ORDER BY id"
    );
    console.log(`\n📚 Found ${coursesResult.rows.length} courses in database:`);
    coursesResult.rows.forEach((course) => {
      console.log(`   - [${course.id}] ${course.title}`);
    });

    await pool.end();
    console.log("\n✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await pool.end();
    process.exit(1);
  }
}

initVideosTable();
