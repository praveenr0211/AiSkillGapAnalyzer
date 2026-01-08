const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const dbAsync = require("./config/database");
const bcrypt = require("bcrypt");

async function initAdminTable() {
  try {
    console.log("🔧 Initializing Admin table...");

    // Check if we're using PostgreSQL or SQLite
    const usePostgres = process.env.DATABASE_URL ? true : false;

    if (usePostgres) {
      // PostgreSQL schema
      await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      // SQLite schema
      await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    console.log("✅ Admin table created successfully");

    // Check if default admin exists
    const existingAdmin = await dbAsync.get(
      "SELECT * FROM admins WHERE email = ?",
      ["admin@skillgap.com"]
    );

    if (!existingAdmin) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await dbAsync.run(
        "INSERT INTO admins (email, password, name) VALUES (?, ?, ?)",
        ["admin@skillgap.com", hashedPassword, "System Administrator"]
      );

      console.log("✅ Default admin user created");
      console.log("📧 Email: admin@skillgap.com");
      console.log("🔑 Password: admin123");
      console.log("⚠️  Please change the password after first login!");
    } else {
      console.log("ℹ️  Default admin user already exists");
    }

    console.log("🎉 Admin table initialization complete!");
  } catch (error) {
    console.error("❌ Error initializing admin table:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initAdminTable()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initAdminTable;
