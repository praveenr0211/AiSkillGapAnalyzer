const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .query(
    `
  SELECT column_name, data_type, is_nullable, column_default 
  FROM information_schema.columns 
  WHERE table_name = 'courses' 
  ORDER BY ordinal_position
`
  )
  .then((result) => {
    console.log("\n📋 Courses table schema:");
    console.log("─".repeat(80));
    result.rows.forEach((col) => {
      console.log(
        `${col.column_name.padEnd(20)} | ${col.data_type.padEnd(
          20
        )} | Nullable: ${col.is_nullable} | Default: ${
          col.column_default || "none"
        }`
      );
    });
    console.log("─".repeat(80));
    pool.end();
  })
  .catch((err) => {
    console.error("Error:", err.message);
    pool.end();
  });
