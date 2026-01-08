require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { GoogleGenerativeAI } = require("@google/generative-ai");

const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
const apiKeys = keysString.split(",").map((key) => key.trim());

console.log(`\n🔍 Testing ${apiKeys.length} API keys...\n`);

async function testKey(key, index) {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      "Say 'test successful' in 2 words"
    );
    const response = await result.response;
    const text = response.text();

    console.log(`✅ Key #${index + 1}: VALID`);
    console.log(`   Response: ${text.trim()}`);
    console.log(
      `   Key: ${key.substring(0, 20)}...${key.substring(key.length - 4)}\n`
    );
    return { index: index + 1, valid: true, key };
  } catch (error) {
    console.log(`❌ Key #${index + 1}: INVALID`);
    console.log(`   Error: ${error.message}`);
    console.log(
      `   Key: ${key.substring(0, 20)}...${key.substring(key.length - 4)}\n`
    );
    return { index: index + 1, valid: false, key, error: error.message };
  }
}

async function testAllKeys() {
  const results = [];

  for (let i = 0; i < apiKeys.length; i++) {
    const result = await testKey(apiKeys[i], i);
    results.push(result);
    // Wait 1 second between tests to avoid rate limiting
    if (i < apiKeys.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n📊 SUMMARY:");
  console.log(`   Total keys: ${results.length}`);
  console.log(`   Valid keys: ${results.filter((r) => r.valid).length}`);
  console.log(`   Invalid keys: ${results.filter((r) => !r.valid).length}\n`);

  const validKeys = results.filter((r) => r.valid);
  if (validKeys.length > 0) {
    console.log("✅ Valid API keys:");
    validKeys.forEach((r) => {
      console.log(
        `   Key #${r.index}: ${r.key.substring(0, 20)}...${r.key.substring(
          r.key.length - 4
        )}`
      );
    });
  }

  const invalidKeys = results.filter((r) => !r.valid);
  if (invalidKeys.length > 0) {
    console.log("\n❌ Invalid API keys:");
    invalidKeys.forEach((r) => {
      console.log(`   Key #${r.index}: ${r.error}`);
    });
  }

  process.exit(0);
}

testAllKeys();
