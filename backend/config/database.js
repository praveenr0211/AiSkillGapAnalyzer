const { Pool } = require("pg");
const path = require("path");

// Check if we should use PostgreSQL (for production) or SQLite (for local dev)
const usePostgres = process.env.DATABASE_URL ? true : false;

let db, dbAsync;

if (usePostgres) {
  // PostgreSQL Configuration for Production (Render)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  pool.on("connect", () => {
    console.log("✅ Connected to PostgreSQL database");
  });

  pool.on("error", (err) => {
    console.error("❌ PostgreSQL connection error:", err);
  });

  dbAsync = {
    query: async (sql, params = []) => {
      // Convert ? placeholders to $1, $2, etc. for PostgreSQL
      let pgSql = sql;
      let paramIndex = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

      const result = await pool.query(pgSql, params);
      return { rows: result.rows, rowCount: result.rowCount };
    },
    run: async (sql, params = []) => {
      // Convert ? placeholders to $1, $2, etc. for PostgreSQL
      let pgSql = sql;
      let paramIndex = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

      const result = await pool.query(pgSql, params);

      // If query has RETURNING clause, return rows
      if (sql.toUpperCase().includes("RETURNING")) {
        return {
          rowCount: result.rowCount,
          rows: result.rows,
          lastID: result.rows[0]?.id,
        };
      }

      return { rowCount: result.rowCount, lastID: result.rows[0]?.id };
    },
    get: async (sql, params = []) => {
      // Convert ? placeholders to $1, $2, etc. for PostgreSQL
      let pgSql = sql;
      let paramIndex = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

      const result = await pool.query(pgSql, params);
      return result.rows[0];
    },
    all: async (sql, params = []) => {
      // Convert ? placeholders to $1, $2, etc. for PostgreSQL
      let pgSql = sql;
      let paramIndex = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

      const result = await pool.query(pgSql, params);
      return result.rows; // Return array of rows
    },
  };

  db = pool;
} else {
  // SQLite Configuration for Local Development
  const sqlite3 = require("sqlite3").verbose();
  const dbPath = path.join(__dirname, "..", "skillgap.db");

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("❌ Error connecting to database:", err);
    } else {
      console.log("✅ Connected to SQLite database");
    }
  });

  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON");

  // Promisify database methods for async/await
  dbAsync = {
    query: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows, rowCount: rows.length });
          }
        });
      });
    },
    run: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ rowCount: this.changes, lastID: this.lastID });
          }
        });
      });
    },
    get: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    },
    all: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows); // Return array of rows
          }
        });
      });
    },
  };
}

module.exports = dbAsync;
