require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const chatService = require("./services/chatService");

console.log("🧪 Testing Results Awareness\n");

async function testResultsAwareness() {
  const contextData = {
    currentPage: "Results Dashboard",
    analysisResult: {
      jobRole: "Frontend Developer",
      matchPercentage: 65,
      matchedSkills: [
        { skill: "React", level: "intermediate" },
        { skill: "JavaScript", level: "advanced" },
        { skill: "CSS", level: "intermediate" },
      ],
      missingSkills: [
        { skill: "TypeScript", priority: "high" },
        { skill: "Redux", priority: "medium" },
        { skill: "Testing", priority: "high" },
      ],
    },
  };

  const questions = [
    "now i have uploaded my resume and can u now see the my resume analysis",
    "what is my match percentage?",
    "what skills am I missing?",
    "what skills do I already have?",
  ];

  for (const question of questions) {
    console.log("\n" + "=".repeat(70));
    console.log(`Question: "${question}"`);
    console.log("=".repeat(70));

    try {
      const response = await chatService.generateChatResponse(
        question,
        [],
        JSON.stringify(contextData),
        "test-user"
      );

      console.log("\n📨 AI Response:");
      console.log(response.message);
    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

testResultsAwareness();
