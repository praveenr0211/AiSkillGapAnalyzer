const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

// Load environment variables FIRST
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// PostgreSQL session store for production
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");

// Then load passport after env vars are loaded
const passport = require("./config/passport");

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const historyRoutes = require("./routes/history");
const progressRoutes = require("./routes/progress");
const chatRoutes = require("./routes/chat");
const jobsRoutes = require("./routes/jobs");
const adminRoutes = require("./routes/admin");
const apiCoursesRoutes = require("./routes/apiCourses");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Render
app.set("trust proxy", 1);

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "skillgap-analyzer-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Use PostgreSQL session store in production
if (process.env.DATABASE_URL) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  sessionConfig.store = new pgSession({
    pool: pool,
    tableName: "session",
    createTableIfMissing: true,
  });

  console.log("✅ Using PostgreSQL session store");
} else {
  console.log("⚠️ Using memory session store (development only)");
}

app.use(session(sessionConfig));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/admin", adminRoutes);
app.use("/api/courses", apiCoursesRoutes);

// Health check endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? "PostgreSQL" : "SQLite",
  });
});

// Serve static files from React build
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  // All remaining requests return the React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
