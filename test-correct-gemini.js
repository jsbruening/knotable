import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function testCorrectGeminiAPI() {
  console.log("🔍 Testing Correct Gemini API Implementation");
  console.log("===========================================");

  const apiKey = process.env.GEMINI_API_KEY;

  console.log("API Key exists:", !!apiKey);

  if (!apiKey) {
    console.log("❌ No GEMINI_API_KEY found in .env file");
    return;
  }

  try {
    // Use the correct GoogleGenAI from @google/genai
    const gemini = new GoogleGenAI({ apiKey });

    console.log("\n🧪 Testing with correct implementation...");

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: 'Say "Hello from Gemini!" and nothing else.',
    });

    console.log("✅ SUCCESS!");
    console.log("Response:", response.text);
    console.log("\n🎉 Gemini is working perfectly!");
    console.log("🚀 You can now generate campaigns with AI!");
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

testCorrectGeminiAPI().catch(console.error);
