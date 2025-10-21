import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function testAzureOpenAI() {
  console.log("🔍 Testing Azure OpenAI (Microsoft Copilot)");
  console.log("==========================================");

  const apiKey = process.env.OPENAI_API_KEY;
  const apiBase = process.env.OPENAI_API_BASE;
  const deploymentName = process.env.OPENAI_DEPLOYMENT_NAME || "gpt-4";

  console.log("API Key exists:", !!apiKey);
  console.log("API Base exists:", !!apiBase);
  console.log("Deployment Name:", deploymentName);

  if (!apiKey) {
    console.log("❌ No OPENAI_API_KEY found in .env file");
    return;
  }

  if (!apiBase) {
    console.log("❌ No OPENAI_API_BASE found in .env file");
    console.log(
      "💡 Add OPENAI_API_BASE=https://your-resource.openai.azure.com/",
    );
    return;
  }

  try {
    const openai = new OpenAI({
      apiKey,
      baseURL: `${apiBase}/openai/deployments/${deploymentName}`,
      defaultQuery: { "api-version": "2024-02-15-preview" },
      defaultHeaders: {
        "api-key": apiKey,
      },
    });

    console.log("\n🧪 Testing Azure OpenAI...");
    const completion = await openai.chat.completions.create({
      model: deploymentName,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: 'Say "Hello from Azure OpenAI!"',
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content || "";
    console.log("✅ SUCCESS! Azure OpenAI is working!");
    console.log("Response:", response);

    console.log("\n🎉 Azure OpenAI is ready for campaign generation!");
  } catch (error) {
    console.log("❌ Error:", error.message);

    if (error.message.includes("401")) {
      console.log("\n🔧 This means:");
      console.log("1. API key is invalid");
      console.log("2. Or the deployment name is wrong");
    } else if (error.message.includes("404")) {
      console.log("\n🔧 This means:");
      console.log("1. The deployment name is incorrect");
      console.log("2. Or the endpoint URL is wrong");
    }

    console.log("\n💡 Check your .env file:");
    console.log("OPENAI_API_KEY=your_azure_api_key");
    console.log("OPENAI_API_BASE=https://your-resource.openai.azure.com/");
    console.log("OPENAI_DEPLOYMENT_NAME=your_deployment_name");
  }
}

testAzureOpenAI().catch(console.error);

