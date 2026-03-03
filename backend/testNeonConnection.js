require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { Pool } = require("pg");

/**
 * Test connection to Neon PostgreSQL database
 * This script helps verify your DATABASE_URL is correctly configured
 */
async function testNeonConnection() {
  console.log("🔍 Testing Neon PostgreSQL connection...\n");

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set!");
    console.log("\n💡 To fix this:");
    console.log("1. Create a .env file in the project root");
    console.log("2. Add your Neon connection string:");
    console.log("   DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require");
    console.log("\n📖 See NEON_SETUP.md for detailed instructions.\n");
    process.exit(1);
  }

  // Mask password in output
  const maskedUrl = DATABASE_URL.replace(
    /(:\/\/[^:]+:)([^@]+)(@)/,
    "$1****$3"
  );
  console.log(`🔗 Connection String: ${maskedUrl}\n`);

  try {
    // Create a connection pool
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 10000, // 10 second timeout
    });

    console.log("⏳ Attempting connection...");

    // Test connection
    const client = await pool.connect();
    console.log("✅ Connection successful!\n");

    // Get database info
    const versionResult = await client.query("SELECT version()");
    const dbVersion = versionResult.rows[0].version;
    console.log("📊 Database Info:");
    console.log(`   Version: ${dbVersion.split(" ")[0]} ${dbVersion.split(" ")[1]}`);

    // Get current timestamp
    const timeResult = await client.query("SELECT NOW()");
    const serverTime = timeResult.rows[0].now;
    console.log(`   Server Time: ${serverTime}`);

    // Check existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`   Tables: ${tablesResult.rows.length} found\n`);

    if (tablesResult.rows.length > 0) {
      console.log("📋 Existing Tables:");
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log("⚠️  No tables found. Run 'node initAllTables.js' to create them.");
    }

    // Clean up
    client.release();
    await pool.end();

    console.log("\n✨ Connection test completed successfully!");
    console.log("🎉 Your Neon database is ready to use!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error(`   Error: ${error.message}\n`);

    console.log("🔧 Troubleshooting:");
    console.log("1. Verify your DATABASE_URL is correct");
    console.log("2. Ensure connection string includes '?sslmode=require'");
    console.log("3. Check if your Neon project is active (not paused)");
    console.log("4. Verify network connectivity");
    console.log("\n📖 See NEON_SETUP.md for more help.\n");

    process.exit(1);
  }
}

// Run the test
testNeonConnection();
