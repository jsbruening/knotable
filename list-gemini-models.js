import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listAvailableModels() {
  console.log("🔍 Listing Available Gemini Models");
  console.log("==================================");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("❌ No GEMINI_API_KEY found in .env file");
    return;
  }

  try {
    const gemini = new GoogleGenerativeAI(apiKey);

    console.log("\n🧪 Fetching available models...");

    // List all available models
    const models = await gemini.listModels();

    console.log("\n✅ Available Models:");
    console.log("====================");

    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName || "N/A"}`);
      console.log(`   Description: ${model.description || "N/A"}`);
      console.log(
        `   Supported Methods: ${model.supportedGenerationMethods?.join(", ") || "N/A"}`,
      );
      console.log("");
    });

    // Find models that support generateContent
    const generateContentModels = models.filter((model) =>
      model.supportedGenerationMethods?.includes("generateContent"),
    );

    console.log("\n🎯 Models that support generateContent:");
    console.log("======================================");

    generateContentModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
    });

    if (generateContentModels.length > 0) {
      console.log("\n🚀 Let's test the first available model...");
      const firstModel = generateContentModels[0];
      const modelName = firstModel.name.split("/").pop(); // Extract just the model name

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
      console.log("\n🎉 Gemini is working! Use this model name:", modelName);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

listAvailableModels().catch(console.error);




