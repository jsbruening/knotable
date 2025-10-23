import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testGeminiFixed() {
  console.log("🔍 Testing Gemini API (with billing enabled)");
  console.log("==========================================");

  const apiKey = process.env.GEMINI_API_KEY;

  console.log("API Key exists:", !!apiKey);

  if (!apiKey) {
    console.log("❌ No GEMINI_API_KEY found in .env file");
    return;
  }

  try {
    const gemini = new GoogleGenerativeAI(apiKey);

    // Try different model names in order of preference
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;

    for (const modelName of models) {
      try {
        console.log(`\n🧪 Trying Gemini model: ${modelName}`);
        const model = gemini.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
          {
            text: 'Say "Hello from Gemini!" and nothing else.',
          },
        ]);

        const response = result.response;
        const content = response.text();

        console.log(`✅ SUCCESS with model: ${modelName}`);
        console.log("Response:", content);
        console.log("\n🎉 Gemini is working! You can now generate campaigns!");
        return;
      } catch (modelError) {
        console.log(`❌ Failed with model ${modelName}:`, modelError.message);
        lastError = modelError;
        continue;
      }
    }

    // If all models failed
    console.log("\n❌ All models failed. Last error:", lastError.message);

    if (lastError.message.includes("404")) {
      console.log("\n🔧 This means:");
      console.log("1. Vertex AI API is not enabled");
      console.log("2. Or billing is not set up");
      console.log("\n💡 Go to Google Cloud Console and:");
      console.log("1. Enable billing for your project");
      console.log("2. Enable Vertex AI API");
    } else if (lastError.message.includes("403")) {
      console.log("\n🔧 This means:");
      console.log("1. API key doesn't have proper permissions");
      console.log("2. Or the API key is invalid");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

testGeminiFixed().catch(console.error);




