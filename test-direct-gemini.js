import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testDirectGeminiAPI() {
  console.log("🔍 Testing Direct Gemini API (Google AI Studio)");
  console.log("==============================================");

  const apiKey = process.env.GEMINI_API_KEY;

  console.log("API Key exists:", !!apiKey);

  if (!apiKey) {
    console.log("❌ No GEMINI_API_KEY found in .env file");
    console.log(
      "\n💡 Get your API key from: https://aistudio.google.com/app/apikey",
    );
    return;
  }

  try {
    // Use direct Gemini API (not Vertex AI)
    const gemini = new GoogleGenerativeAI(apiKey);

    console.log("\n🧪 Testing Direct Gemini API...");

    // Try the most common model names
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;

    for (const modelName of models) {
      try {
        console.log(`\nTrying model: ${modelName}`);
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
        console.log("\n🎉 Direct Gemini API is working!");
        console.log("🚀 You can now generate campaigns without Vertex AI!");
        return;
      } catch (modelError) {
        console.log(`❌ Failed with model ${modelName}:`, modelError.message);
        lastError = modelError;
        continue;
      }
    }

    // If all models failed
    console.log("\n❌ All models failed. Last error:", lastError.message);

    if (lastError.message.includes("API_KEY_INVALID")) {
      console.log("\n🔧 This means:");
      console.log("1. Your API key is invalid");
      console.log("2. Or you need to get a new API key");
      console.log(
        "\n💡 Get a new API key from: https://aistudio.google.com/app/apikey",
      );
    } else if (lastError.message.includes("PERMISSION_DENIED")) {
      console.log("\n🔧 This means:");
      console.log("1. API key doesn't have proper permissions");
      console.log("2. Or the API key is restricted");
    } else if (lastError.message.includes("QUOTA_EXCEEDED")) {
      console.log("\n🔧 This means:");
      console.log("1. You've exceeded your free quota");
      console.log("2. Or billing is required");
    }
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }
}

testDirectGeminiAPI().catch(console.error);




