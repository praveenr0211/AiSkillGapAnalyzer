const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Analyze skills using Gemini AI with retry logic
 */
exports.analyzeSkills = async (resumeText, jobSkills, jobRole) => {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  let currentApiKey = process.env.GEMINI_API_KEY;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Initialize Gemini AI with single key
      const genAI = new GoogleGenerativeAI(currentApiKey);

      // Get Gemini model - using gemini-1.5-flash for free tier compatibility
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      // Construct prompt
      const prompt = buildPrompt(resumeText, jobSkills, jobRole);

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const analysis = parseGeminiResponse(text);

      return analysis;
    } catch (error) {
      console.error(
        `Gemini AI error (attempt ${attempt}/${maxRetries}):`,
        error.message
      );

      // If rate limited, log and retry after delay
      if (
        error.message.includes("429") ||
        error.message.includes("RESOURCE_EXHAUSTED")
      ) {
        console.log(
          `⚠️  Rate limit hit. Waiting ${retryDelay}ms before retry...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt)
        );
        continue;
      }

      // For other errors, log and break
      console.log("Error encountered. Stopping retries.");
      break;
    }
  }

  // If all retries exhausted (shouldn't reach here, but safety net)
  console.log("Retries exhausted. Using fallback analysis...");
  return generateFallbackAnalysis(resumeText, jobSkills, jobRole);
};

/**
 * Generate fallback analysis when API is unavailable
 */
function generateFallbackAnalysis(resumeText, jobSkills, jobRole) {
  const resumeLower = resumeText.toLowerCase();
  const requiredSkills = Array.isArray(jobSkills)
    ? jobSkills
    : jobSkills.split(",").map((s) => s.trim());

  // Find matched skills by checking if they appear in resume
  const matched = [];
  const missing = [];

  requiredSkills.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    if (resumeLower.includes(skillLower)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  // Calculate match percentage
  const matchPercentage = Math.round(
    (matched.length / requiredSkills.length) * 100
  );

  // Course recommendations database for common skills
  const courseRecommendations = {
    JavaScript: [
      {
        title: "The Complete JavaScript Course 2024",
        platform: "Udemy",
        url: "https://www.udemy.com/course/the-complete-javascript-course/",
        cost: "$10-50",
        rating: "4.7/5",
      },
      {
        title: "JavaScript Algorithms and Data Structures",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
        cost: "Free",
        rating: "4.8/5",
      },
    ],
    React: [
      {
        title: "React - The Complete Guide 2024",
        platform: "Udemy",
        url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
        cost: "$10-50",
        rating: "4.6/5",
      },
      {
        title: "React Tutorial for Beginners",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=SqcY0GlETPk",
        cost: "Free",
        rating: "4.9/5",
      },
    ],
    Python: [
      {
        title: "Complete Python Bootcamp",
        platform: "Udemy",
        url: "https://www.udemy.com/course/complete-python-bootcamp/",
        cost: "$10-50",
        rating: "4.6/5",
      },
      {
        title: "Python for Everybody",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/python",
        cost: "Free (audit)",
        rating: "4.8/5",
      },
    ],
    "Node.js": [
      {
        title: "NodeJS - The Complete Guide",
        platform: "Udemy",
        url: "https://www.udemy.com/course/nodejs-the-complete-guide/",
        cost: "$10-50",
        rating: "4.6/5",
      },
      {
        title: "Node.js Tutorial for Beginners",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
        cost: "Free",
        rating: "4.8/5",
      },
    ],
    AWS: [
      {
        title: "AWS Certified Solutions Architect",
        platform: "Udemy",
        url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
        cost: "$10-50",
        rating: "4.7/5",
      },
      {
        title: "AWS Fundamentals",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/aws-fundamentals-going-cloud-native",
        cost: "Free (audit)",
        rating: "4.6/5",
      },
    ],
  };

  // Generic courses for other skills
  const genericCourses = [
    {
      title: "Online courses on Udemy and Coursera",
      platform: "Udemy",
      url: "https://www.udemy.com/",
      cost: "$10-50",
      rating: "4.5/5",
    },
    {
      title: "YouTube tutorials and documentation",
      platform: "YouTube",
      url: "https://www.youtube.com/",
      cost: "Free",
      rating: "4.7/5",
    },
  ];

  // Project ideas database
  const projectIdeas = {
    JavaScript: [
      "Build an interactive todo list with local storage",
      "Create a weather app using a public API",
    ],
    React: [
      "Build a personal portfolio website with React",
      "Create a movie search app using React and an API",
    ],
    Python: [
      "Build a web scraper with Beautiful Soup",
      "Create a data analysis project with Pandas",
    ],
    "Node.js": [
      "Build a REST API with Express.js",
      "Create a real-time chat app with Socket.io",
    ],
    AWS: [
      "Deploy a web app on AWS EC2",
      "Set up an S3 bucket for static website hosting",
    ],
  };

  // Generate learning roadmap for missing skills
  const roadmap = missing.slice(0, 7).map((skill) => {
    const courses = courseRecommendations[skill] || genericCourses;
    const projects = projectIdeas[skill] || [
      `Build a hands-on project using ${skill}`,
      `Contribute to open source projects using ${skill}`,
    ];

    return {
      skill: skill,
      resources: courses,
      timeline: "2-4 weeks",
      projects: projects,
    };
  });

  return {
    match_percentage: matchPercentage,
    matched_skills: matched,
    missing_skills: missing,
    learning_roadmap: roadmap,
  };
}

/**
 * Build structured prompt for Gemini
 */
function buildPrompt(resumeText, jobSkills, jobRole) {
  const jobSkillsList = Array.isArray(jobSkills)
    ? jobSkills.join(", ")
    : jobSkills;

  return `You are an AI career advisor analyzing a candidate's resume for the job role: "${jobRole}".

RESUME CONTENT:
${resumeText}

REQUIRED SKILLS FOR ${jobRole.toUpperCase()}:
${jobSkillsList}

TASK:
1. Extract all technical and professional skills mentioned in the resume
2. Compare resume skills with the required job skills
3. Calculate match percentage (0-100)
4. Identify matched skills (skills present in both resume and job requirements)
5. Identify missing skills (required job skills not found in resume)
6. Create a personalized learning roadmap for the missing skills with:
   - Specific course links (Udemy, Coursera, YouTube, freeCodeCamp)
   - Estimated costs (Free, $10-50, $50-100, etc.)
   - Community ratings (4.5/5, 4.8/5, etc.)
   - Project ideas to practice each skill

IMPORTANT: Return ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "match_percentage": <number between 0-100>,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "learning_roadmap": [
    {
      "skill": "skill name",
      "resources": [
        {
          "title": "Course/Tutorial Name",
          "platform": "Udemy/Coursera/YouTube/freeCodeCamp",
          "url": "actual course URL",
          "cost": "Free or price range",
          "rating": "4.5/5 or similar"
        }
      ],
      "timeline": "estimated time to learn (e.g., 2-4 weeks)",
      "projects": [
        "Project idea 1 to practice this skill",
        "Project idea 2 to practice this skill"
      ]
    }
  ]
}

Provide a learning roadmap for the top 5-7 most important missing skills with at least 2-3 resources per skill.`;
}

/**
 * Parse Gemini response and extract JSON
 */
function parseGeminiResponse(text) {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();

    // Remove ```json or ``` markers
    cleanText = cleanText.replace(/```json\s*/g, "");
    cleanText = cleanText.replace(/```\s*/g, "");

    // Find JSON object in the text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (
      !parsed.match_percentage ||
      !parsed.matched_skills ||
      !parsed.missing_skills ||
      !parsed.learning_roadmap
    ) {
      throw new Error("Invalid response structure from AI");
    }

    // Ensure match_percentage is a number
    parsed.match_percentage = Math.round(Number(parsed.match_percentage));

    return parsed;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.error("Raw text:", text);

    // Return fallback response
    return {
      match_percentage: 0,
      matched_skills: [],
      missing_skills: [],
      learning_roadmap: [
        {
          skill: "Analysis Error",
          resources: "Unable to parse AI response. Please try again.",
          timeline: "N/A",
        },
      ],
    };
  }
}

/**
 * Extract required skills from a custom job description
 */
exports.extractSkillsFromJobDescription = async (jobDescription) => {
  const maxRetries = 3;
  const retryDelay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `You are an AI job requirement analyzer. Extract all required skills from this job description.

JOB DESCRIPTION:
${jobDescription}

TASK:
Identify and extract ALL required technical skills, soft skills, tools, technologies, programming languages, frameworks, and qualifications mentioned in the job description.

IMPORTANT: Return ONLY a valid JSON array of skill strings (no markdown, no code blocks, no extra text):
["skill1", "skill2", "skill3", "skill4", "skill5"]

Include 10-25 skills. Be specific and comprehensive.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse skills array
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\s*/g, "");
      cleanText = cleanText.replace(/```\s*/g, "");

      const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
      if (!arrayMatch) {
        throw new Error("No JSON array found in response");
      }

      const skills = JSON.parse(arrayMatch[0]);

      if (!Array.isArray(skills) || skills.length === 0) {
        throw new Error("Invalid skills array");
      }

      console.log(`✅ Extracted ${skills.length} skills from job description`);
      return skills;
    } catch (error) {
      console.error(
        `Skill extraction error (attempt ${attempt}/${maxRetries}):`,
        error.message
      );

      if (error.message.includes("429") && attempt < maxRetries) {
        console.log(`Rate limited. Waiting ${retryDelay}ms before retry...`);
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt)
        );
        continue;
      }

      if (error.message.includes("429")) {
        console.log("Rate limit exceeded. Using keyword extraction...");
        return extractSkillsUsingKeywords(jobDescription);
      }

      throw new Error("Failed to extract skills: " + error.message);
    }
  }
};

/**
 * Fallback skill extraction using keywords
 */
function extractSkillsUsingKeywords(jobDescription) {
  const text = jobDescription.toLowerCase();
  const commonSkills = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Ruby",
    "PHP",
    "Go",
    "Rust",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring Boot",
    "HTML",
    "CSS",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Git",
    "REST API",
    "GraphQL",
    "Microservices",
    "Agile",
    "Scrum",
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Data Analysis",
    "Pandas",
    "NumPy",
    "Tableau",
    "Power BI",
    "Communication",
    "Leadership",
    "Problem Solving",
    "Teamwork",
  ];

  const foundSkills = commonSkills.filter((skill) =>
    text.includes(skill.toLowerCase())
  );

  console.log(`⚠️ Fallback extraction found ${foundSkills.length} skills`);
  return foundSkills.length > 0
    ? foundSkills
    : ["General Skills", "Technical Skills"];
}
