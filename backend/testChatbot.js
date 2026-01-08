require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const chatService = require("./services/chatService");

console.log("🧪 Testing Chatbot API Key Usage\n");
console.log("Environment Variables:");
console.log(
  "  - CHATBOT_API_KEY:",
  process.env.CHATBOT_API_KEY ? "✅ Set" : "❌ Not Set"
);
console.log(
  "  - Key starts with:",
  process.env.CHATBOT_API_KEY
    ? process.env.CHATBOT_API_KEY.substring(0, 15) + "..."
    : "N/A"
);
console.log("\n" + "=".repeat(60) + "\n");

async function testChatbot() {
  try {
    console.log("Sending test message to chatbot...\n");

    const response = await chatService.generateChatResponse(
      "Hello! Can you introduce yourself?",
      [], // empty conversation history
      null, // no context data
      "test-user-123"
    );

    console.log("\n" + "=".repeat(60));
    console.log("✅ CHATBOT TEST SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("\n📨 AI Response:");
    console.log(response.message);
    console.log("\n📊 Response Stats:");
    console.log("  - Success:", response.success);
    console.log("  - Tokens Used (approx):", response.tokensUsed);
    console.log("\n✅ API Key is working correctly!");
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ CHATBOT TEST FAILED!");
    console.error("=".repeat(60));
    console.error("\n🚨 Error:", error.message);
    console.error("\n📋 Stack:", error.stack);
  }
}

testChatbot();
