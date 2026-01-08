require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const chatService = require("./services/chatService");

console.log("🧪 Testing Page Context Awareness\n");

async function testPageContext() {
  const message = "what page am I on?";

  const pages = [
    { page: "Results Dashboard", desc: "Results page" },
    { page: "Courses", desc: "Courses page" },
    { page: "History", desc: "History page" },
  ];

  for (const pageTest of pages) {
    console.log("\n" + "=".repeat(60));
    console.log(`Current Page: ${pageTest.page}`);
    console.log("=".repeat(60));

    try {
      const response = await chatService.generateChatResponse(
        message,
        [],
        JSON.stringify({
          currentPage: pageTest.page,
          analysisResult: {
            jobRole: "Frontend Developer",
            matchPercentage: 65,
          },
        }),
        "test-user"
      );

      console.log("\n📨 AI Response:");
      console.log(response.message);
    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

testPageContext();
