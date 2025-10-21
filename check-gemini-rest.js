import dotenv from "dotenv";

dotenv.config();

async function checkGeminiAPI() {
  console.log("🔍 Checking Gemini API Directly");
  console.log("===============================");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("❌ No GEMINI_API_KEY found in .env file");
    return;
  }

  try {
    // Try to list models using REST API
    console.log("\n🧪 Fetching available models via REST API...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log("Error details:", errorText);
      return;
    }

    const data = await response.json();

    console.log("\n✅ Available Models:");
    console.log("====================");

    if (data.models && data.models.length > 0) {
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   Display Name: ${model.displayName || "N/A"}`);
        console.log(`   Description: ${model.description || "N/A"}`);
        console.log(
          `   Supported Methods: ${model.supportedGenerationMethods?.join(", ") || "N/A"}`,
        );
        console.log("");
      });

      // Find models that support generateContent
      const generateContentModels = data.models.filter((model) =>
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

        // Test the model
        const testResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: 'Say "Hello from Gemini!" and nothing else.',
                    },
                  ],
                },
              ],
            }),
          },
        );

        if (testResponse.ok) {
          const testData = await testResponse.json();
          const content = testData.candidates?.[0]?.content?.parts?.[0]?.text;

          console.log(`✅ SUCCESS with model: ${modelName}`);
          console.log("Response:", content);
          console.log(
            "\n🎉 Gemini is working! Use this model name:",
            modelName,
          );
        } else {
          console.log(
            `❌ Test failed: ${testResponse.status} ${testResponse.statusText}`,
          );
        }
      }
    } else {
      console.log("❌ No models found in response");
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

checkGeminiAPI().catch(console.error);

