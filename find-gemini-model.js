import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function findWorkingGeminiModel() {
  console.log("🔍 Finding Working Gemini Model");
  console.log("===============================");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("❌ No GEMINI_API_KEY found in .env file");
    return;
  }

  try {
    const gemini = new GoogleGenerativeAI(apiKey);

    // Try different model names that might be available
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.0-pro",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro-001",
      "gemini-1.5-flash-001",
      "models/gemini-1.5-flash",
      "models/gemini-1.5-pro",
      "models/gemini-pro",
    ];

    console.log("\n🧪 Testing different model names...");

    for (const modelName of modelsToTry) {
      try {
        console.log(`\nTrying: ${modelName}`);
        const model = gemini.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
          {
            text: 'Say "Hello from Gemini!" and nothing else.',
          },
        ]);

        const response = await result.response;
        const content = response.text();

        console.log(`✅ SUCCESS with model: ${modelName}`);
        console.log("Response:", content);
        console.log(
          "\n🎉 Found working model! Use this in your code:",
          modelName,
        );
        return modelName;
      } catch (modelError) {
        console.log(`❌ Failed: ${modelError.message}`);
        continue;
      }
    }

    console.log("\n❌ No working models found.");
    console.log("\n💡 Possible solutions:");
    console.log("1. Check if your API key has the right permissions");
    console.log("2. Try a different API key from Google AI Studio");
    console.log("3. Check if there are any regional restrictions");
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }
}

findWorkingGeminiModel().catch(console.error);
