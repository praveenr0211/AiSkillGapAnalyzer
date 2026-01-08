require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { GoogleGenerativeAI } = require("@google/generative-ai");

const modelsToTest = [
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-pro",
  "gemini-1.0-pro",
  "gemini-exp-1206",
];

async function quickTest() {
  const apiKey = process.env.CHATBOT_API_KEY;
  console.log("Testing API Key:", apiKey.substring(0, 15) + "...\n");

  for (const modelName of modelsToTest) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      const response = await result.response;
      const text = response.text();
      console.log(
        `✅ ${modelName}: WORKS! Response: ${text.substring(0, 50)}...`
      );
      return; // Stop at first working model
    } catch (err) {
      if (err.message.includes("429") || err.message.includes("quota")) {
        console.log(`⚠️  ${modelName}: Quota exceeded`);
      } else if (
        err.message.includes("404") ||
        err.message.includes("not found")
      ) {
        console.log(`❌ ${modelName}: Not found`);
      } else {
        console.log(`❌ ${modelName}: ${err.message.substring(0, 60)}`);
      }
    }
  }

  console.log("\n❌ No working models found");
}

quickTest();
