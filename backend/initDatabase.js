require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const db = require("./config/database");

/**
 * Initialize database schema and seed data
 */
async function initDatabase() {
  console.log("🔧 Initializing database...");

  try {
    // Create job_skills table
    await db.run(`
      CREATE TABLE IF NOT EXISTS job_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_role TEXT NOT NULL UNIQUE,
        required_skills TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table created successfully");

    // Seed data
    await seedData();

    console.log("🎉 Database initialization complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating table:", err);
    process.exit(1);
  }
}

/**
 * Seed job roles and required skills
 */
async function seedData() {
  const jobRoles = [
    {
      job_role: "Frontend Developer",
      required_skills: JSON.stringify([
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Git",
        "Responsive Design",
        "RESTful APIs",
      ]),
    },
    {
      job_role: "Backend Developer",
      required_skills: JSON.stringify([
        "Node.js",
        "Express.js",
        "SQL",
        "MongoDB",
        "RESTful APIs",
        "Authentication (JWT/OAuth)",
        "Git",
      ]),
    },
    {
      job_role: "Data Analyst",
      required_skills: JSON.stringify([
        "Python",
        "SQL",
        "Excel",
        "Tableau",
        "Statistics",
        "Data Visualization",
        "Pandas",
      ]),
    },
    {
      job_role: "AI Engineer",
      required_skills: JSON.stringify([
        "Python",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "Neural Networks",
        "Model Deployment",
      ]),
    },
    {
      job_role: "Full Stack Developer",
      required_skills: JSON.stringify([
        "JavaScript",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "HTML",
        "CSS",
        "Git",
        "RESTful APIs",
      ]),
    },
    {
      job_role: "DevOps Engineer",
      required_skills: JSON.stringify([
        "Linux",
        "Docker",
        "Kubernetes",
        "CI/CD",
        "AWS/GCP/Azure",
        "Git",
        "Python",
      ]),
    },
    {
      job_role: "Mobile Developer",
      required_skills: JSON.stringify([
        "React Native",
        "JavaScript",
        "iOS Development",
        "Android Development",
        "RESTful APIs",
        "Git",
      ]),
    },
    {
      job_role: "Data Scientist",
      required_skills: JSON.stringify([
        "Python",
        "Machine Learning",
        "Statistics",
        "SQL",
        "Pandas",
        "Scikit-learn",
        "Data Visualization",
      ]),
    },
  ];

  try {
    for (const role of jobRoles) {
      await db.run(
        `INSERT OR IGNORE INTO job_skills (job_role, required_skills) VALUES (?, ?)`,
        [role.job_role, role.required_skills]
      );
      console.log(`✅ Inserted: ${role.job_role}`);
    }

    console.log(`\n🎉 Database initialized with ${jobRoles.length} job roles`);
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    throw err;
  }
}

// Run initialization
initDatabase();
