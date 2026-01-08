require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { GoogleGenerativeAI } = require("@google/generative-ai");

const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
const apiKeys = keysString.split(",").map((key) => key.trim());

console.log(`\n📋 Listing available models for first API key...\n`);

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(apiKeys[0]);

    // Try to list models
    const models = await genAI.listModels();

    console.log("✅ Available models:");
    for await (const model of models) {
      console.log(`  - ${model.name}`);
      console.log(
        `    Supports: ${model.supportedGenerationMethods.join(", ")}`
      );
    }
  } catch (error) {
    console.error("❌ Error listing models:", error.message);

    // Try different model names
    console.log("\n🔍 Testing different model names:\n");
    const modelsToTest = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "models/gemini-pro",
      "models/gemini-1.5-flash",
    ];

    for (const modelName of modelsToTest) {
      try {
        const genAI = new GoogleGenerativeAI(apiKeys[0]);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        const response = await result.response;
        console.log(`✅ ${modelName}: WORKS`);
        break; // Found a working model
      } catch (err) {
        if (err.message.includes("429") || err.message.includes("quota")) {
          console.log(
            `⚠️  ${modelName}: Quota exceeded (model exists but no quota)`
          );
        } else if (err.message.includes("404")) {
          console.log(`❌ ${modelName}: Not found`);
        } else {
          console.log(`❓ ${modelName}: ${err.message.substring(0, 80)}...`);
        }
      }
    }
  }

  process.exit(0);
}

listModels();
