require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

/**
 * Initialize all database tables in sequence
 * This script runs all init scripts to set up the complete database schema
 */
async function initAllTables() {
  console.log("🔧 Starting database initialization...\n");

  const scripts = [
    { name: "Users Table", file: "./initUsersTable.js" },
    { name: "Job Skills Table", file: "./initDatabase.js" },
    { name: "Analysis History Table", file: "./initHistoryTable.js" },
    { name: "User Progress Table", file: "./initProgressTable.js" },
    { name: "Chat Tables", file: "./initChatTable.js" },
    { name: "Admin Table", file: "./initAdminTable.js" },
    { name: "Courses Table", file: "./initCoursesTable.js" },
    { name: "Videos Table", file: "./initVideosTable.js" },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const script of scripts) {
    try {
      console.log(`📝 Initializing ${script.name}...`);
      
      // Dynamically require and execute the init script
      const initScript = require(script.file);
      
      // Some scripts export a function, others execute immediately
      if (typeof initScript === "function") {
        await initScript();
      }
      
      console.log(`✅ ${script.name} initialized successfully\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error initializing ${script.name}:`, error.message);
      failCount++;
      // Continue with other scripts even if one fails
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Database Initialization Summary:");
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📋 Total: ${scripts.length}`);
  console.log("=".repeat(50) + "\n");

  if (failCount === 0) {
    console.log("🎉 All database tables initialized successfully!");
    console.log("✨ Your app is ready to use!\n");
  } else {
    console.log("⚠️  Some tables failed to initialize. Check errors above.");
    console.log("💡 The app may still work if essential tables are ready.\n");
  }

  return { successCount, failCount, total: scripts.length };
}

// Run if executed directly
if (require.main === module) {
  initAllTables()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fatal error during initialization:", error);
      process.exit(1);
    });
}

module.exports = initAllTables;
