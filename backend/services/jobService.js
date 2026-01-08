const axios = require("axios");

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";

/**
 * Calculate match percentage between user skills and job requirements
 * Enhanced with better skill extraction and synonym matching
 */
function calculateMatchPercentage(userSkills, jobDescription) {
  if (!userSkills || userSkills.length === 0) {
    return { matchPercentage: 0, matchedSkills: [], missingSkills: [] };
  }

  const jobText = jobDescription.toLowerCase();
  const matchedSkills = [];
  const missingSkills = [];

  // Skill synonyms and variations for better matching
  const skillSynonyms = {
    javascript: ["js", "javascript", "ecmascript", "es6", "es2015"],
    typescript: ["ts", "typescript"],
    python: ["python", "py", "python3"],
    java: ["java", "jdk", "jvm"],
    react: ["react", "reactjs", "react.js"],
    angular: ["angular", "angularjs", "angular.js"],
    vue: ["vue", "vuejs", "vue.js"],
    node: ["node", "nodejs", "node.js"],
    express: ["express", "expressjs", "express.js"],
    mongodb: ["mongodb", "mongo"],
    postgresql: ["postgresql", "postgres", "psql"],
    mysql: ["mysql", "mariadb"],
    sql: ["sql", "t-sql", "pl/sql"],
    nosql: ["nosql", "no-sql"],
    aws: ["aws", "amazon web services", "ec2", "s3", "lambda"],
    azure: ["azure", "microsoft azure"],
    gcp: ["gcp", "google cloud", "google cloud platform"],
    docker: ["docker", "containerization", "containers"],
    kubernetes: ["kubernetes", "k8s"],
    git: ["git", "github", "gitlab", "version control"],
    rest: ["rest", "restful", "rest api"],
    graphql: ["graphql", "graph ql"],
    html: ["html", "html5"],
    css: ["css", "css3", "styling"],
    sass: ["sass", "scss"],
    bootstrap: ["bootstrap", "bootstrap4", "bootstrap5"],
    tailwind: ["tailwind", "tailwindcss"],
    redux: ["redux", "redux-toolkit"],
    jest: ["jest", "unit testing"],
    webpack: ["webpack", "bundler"],
    agile: ["agile", "scrum", "kanban"],
    ci: ["ci/cd", "continuous integration", "jenkins", "github actions"],
  };

  // Expanded comprehensive tech skills database
  const comprehensiveTechSkills = [
    // Frontend
    "javascript",
    "typescript",
    "react",
    "angular",
    "vue",
    "svelte",
    "html",
    "css",
    "sass",
    "less",
    "tailwind",
    "bootstrap",
    "jquery",
    "redux",
    "mobx",
    "webpack",
    "vite",
    "next.js",
    "nuxt",
    "gatsby",
    // Backend
    "node",
    "express",
    "python",
    "django",
    "flask",
    "fastapi",
    "java",
    "spring",
    "springboot",
    "php",
    "laravel",
    "ruby",
    "rails",
    "go",
    "golang",
    "rust",
    "c#",
    ".net",
    "asp.net",
    // Databases
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "elasticsearch",
    "cassandra",
    "dynamodb",
    "sqlite",
    "oracle",
    "mariadb",
    "nosql",
    // Cloud & DevOps
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "ansible",
    "jenkins",
    "ci/cd",
    "github actions",
    "gitlab ci",
    "nginx",
    "apache",
    "linux",
    "bash",
    "shell scripting",
    // Mobile
    "react native",
    "flutter",
    "swift",
    "kotlin",
    "android",
    "ios",
    "xamarin",
    // Data & AI
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "pandas",
    "numpy",
    "data analysis",
    "tableau",
    "power bi",
    "spark",
    "hadoop",
    "kafka",
    // Testing & Tools
    "jest",
    "mocha",
    "cypress",
    "selenium",
    "junit",
    "pytest",
    "testing",
    "tdd",
    "bdd",
    // API & Architecture
    "rest",
    "graphql",
    "grpc",
    "microservices",
    "api",
    "soap",
    "websocket",
    // Version Control & Collaboration
    "git",
    "github",
    "gitlab",
    "bitbucket",
    "jira",
    "confluence",
    // Methodologies
    "agile",
    "scrum",
    "kanban",
    "devops",
    "ux",
    "ui",
    // Other
    "security",
    "oauth",
    "jwt",
    "authentication",
    "encryption",
    "performance optimization",
  ];

  // Normalize user skills
  const normalizedUserSkills = userSkills.map((skill) => {
    const skillName = typeof skill === "string" ? skill : skill.skill;
    return skillName.toLowerCase().trim();
  });

  // Check user skills against job description with synonym matching
  userSkills.forEach((skill) => {
    const skillName = typeof skill === "string" ? skill : skill.skill;
    const normalizedSkill = skillName.toLowerCase().trim();

    // Get synonyms for this skill
    const synonyms = skillSynonyms[normalizedSkill] || [normalizedSkill];

    // Check if any synonym matches
    const isMatched = synonyms.some((synonym) => {
      // Use word boundary regex for more accurate matching
      const regex = new RegExp(
        `\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      );
      return regex.test(jobText);
    });

    if (isMatched && !matchedSkills.includes(skillName)) {
      matchedSkills.push(skillName);
    }
  });

  // Extract required skills from job description using comprehensive database
  comprehensiveTechSkills.forEach((keyword) => {
    const synonyms = skillSynonyms[keyword] || [keyword];

    // Check if any synonym appears in job description
    const appearsInJob = synonyms.some((synonym) => {
      const regex = new RegExp(
        `\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      );
      return regex.test(jobText);
    });

    if (appearsInJob) {
      // Check if user has this skill (including synonyms)
      const userHasSkill = normalizedUserSkills.some((userSkill) => {
        return synonyms.some(
          (synonym) =>
            userSkill.includes(synonym) || synonym.includes(userSkill)
        );
      });

      if (!userHasSkill && !missingSkills.includes(keyword)) {
        missingSkills.push(keyword);
      }
    }
  });

  // Calculate match percentage
  const totalRelevantSkills = matchedSkills.length + missingSkills.length;
  const matchPercentage =
    totalRelevantSkills > 0
      ? Math.round((matchedSkills.length / totalRelevantSkills) * 100)
      : 0;

  return {
    matchPercentage,
    matchedSkills,
    missingSkills: missingSkills.slice(0, 8), // Increased limit for better visibility
  };
}

/**
 * Fetch jobs from Adzuna API
 */
exports.searchJobs = async ({
  query,
  location = "us",
  page = 1,
  resultsPerPage = 20,
  userSkills = [],
}) => {
  try {
    if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
      throw new Error("Adzuna API credentials not configured");
    }

    // Build Adzuna API URL
    const url = `${ADZUNA_BASE_URL}/${location}/search/${page}`;

    console.log(`🔍 Fetching jobs for: ${query} in ${location}`);

    const response = await axios.get(url, {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        what: query,
        results_per_page: resultsPerPage,
        "content-type": "application/json",
      },
    });

    const jobs = response.data.results || [];

    // Enrich jobs with match percentage
    const enrichedJobs = jobs.map((job) => {
      const { matchPercentage, matchedSkills, missingSkills } =
        calculateMatchPercentage(
          userSkills,
          `${job.title} ${job.description}`.toLowerCase()
        );

      return {
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        description: job.description,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        salary_is_predicted: job.salary_is_predicted,
        contract_type: job.contract_type || "Not specified",
        contract_time: job.contract_time || "Full-time",
        created: job.created,
        redirect_url: job.redirect_url,
        matchPercentage,
        matchedSkills,
        missingSkills,
      };
    });

    // Sort by match percentage (highest first)
    enrichedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return {
      success: true,
      jobs: enrichedJobs,
      count: enrichedJobs.length,
      total: response.data.count || 0,
    };
  } catch (error) {
    console.error("Error fetching jobs from Adzuna:", error.message);
    return {
      success: false,
      error: error.message,
      jobs: [],
    };
  }
};

/**
 * Get job details by ID
 */
exports.getJobDetails = async (jobId, userSkills = []) => {
  try {
    // Note: Adzuna doesn't have a direct job detail endpoint
    // This is a placeholder for when we store jobs or need to refetch
    return {
      success: true,
      message: "Job details endpoint - implementation pending",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
