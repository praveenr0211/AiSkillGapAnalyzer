require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const chatService = require("./services/chatService");

console.log("🧪 Testing Short Response Behavior\n");

async function testMessages() {
  const tests = [
    { message: "hello", description: "Simple greeting" },
    { message: "hi", description: "Short greeting" },
    { message: "what can you do?", description: "Capability question" },
  ];

  for (const test of tests) {
    console.log("\n" + "=".repeat(60));
    console.log(`Test: ${test.description}`);
    console.log(`Message: "${test.message}"`);
    console.log("=".repeat(60));

    try {
      const response = await chatService.generateChatResponse(
        test.message,
        [],
        JSON.stringify({
          currentPage: "Results Dashboard",
          analysisResult: {
            jobRole: "Frontend Developer",
            matchPercentage: 65,
            matchedSkills: ["React", "JavaScript", "CSS"],
            missingSkills: ["TypeScript", "Redux", "Testing"],
          },
        }),
        "test-user"
      );

      console.log("\n📨 AI Response:");
      console.log(response.message);
      console.log(`\n📊 Length: ${response.message.length} characters`);
      console.log(`📊 Tokens: ${response.tokensUsed}`);
    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

testMessages();
