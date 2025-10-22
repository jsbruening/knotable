import { env } from "~/env.js";
import { generateCampaignContent as generateWithGemini } from "./gemini";
import { generateCampaignContent as generateWithOpenAI } from "./openai";

// Helper function to check if Gemini is disabled from database
async function isGeminiDisabledFromDB(): Promise<boolean> {
  try {
    const response = await fetch("/api/trpc/adminSettings.getGeminiDisabled", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.result?.data === true;
    }
  } catch (error) {
    console.warn("Failed to check Gemini disable status from database:", error);
  }

  return false;
}

export type LLMProvider = "gemini" | "openai" | "auto";

export interface LLMConfig {
  provider: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResult {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  cost?: number;
  responseTime: number;
}

// Default LLM configuration
const DEFAULT_CONFIG: LLMConfig = {
  provider: "auto", // Will rotate between available providers
  temperature: 0.7,
  maxTokens: 2000,
};

// Provider configurations
const PROVIDER_CONFIGS = {
  gemini: {
    name: "Google Gemini",
    models: ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
    defaultModel: "gemini-2.5-flash",
    costPerToken: 0.000001, // Approximate
    enabled: !!env.GEMINI_API_KEY && env.DISABLE_GEMINI !== "true",
  },
  openai: {
    name: "OpenAI",
    models: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"],
    defaultModel: "gpt-3.5-turbo",
    costPerToken: 0.000002, // Approximate
    enabled: !!env.OPENAI_API_KEY,
  },
};

// Get available providers (with async database check for Gemini)
export async function getAvailableProviders(): Promise<string[]> {
  const providers = [];
  
  // Check Gemini (environment + database)
  if (env.GEMINI_API_KEY && env.DISABLE_GEMINI !== "true") {
    const isDisabledInDB = await isGeminiDisabledFromDB();
    if (!isDisabledInDB) {
      providers.push("gemini");
    }
  }
  
  // Check OpenAI
  if (env.OPENAI_API_KEY) {
    providers.push("openai");
  }
  
  return providers;
}

// Get provider configuration
export function getProviderConfig(provider: string) {
  return PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
}

// Smart LLM selection logic
async function selectProvider(config: LLMConfig): Promise<string> {
  const availableProviders = await getAvailableProviders();
  
  if (availableProviders.length === 0) {
    throw new Error("No LLM providers are available. Please check your API keys.");
  }

  // If specific provider requested and available
  if (config.provider !== "auto" && availableProviders.includes(config.provider)) {
    return config.provider;
  }

  // Auto-selection logic (can be enhanced with cost/performance metrics)
  if (config.provider === "auto") {
    // Simple rotation: prefer Gemini for cost, OpenAI for reliability
    if (availableProviders.includes("gemini")) {
      return "gemini";
    }
    if (availableProviders.includes("openai")) {
      return "openai";
    }
  }

  // Fallback to first available
  return availableProviders[0];
}

// Main LLM generation function with rotation and fallback
export async function generateWithLLM(
  prompt: string,
  config: LLMConfig = DEFAULT_CONFIG
): Promise<LLMResult> {
  const startTime = Date.now();
  const selectedProvider = await selectProvider(config);
  const providerConfig = getProviderConfig(selectedProvider);

  console.log(`🤖 Using ${providerConfig.name} (${selectedProvider})`);

  try {
    let content: string;
    let tokensUsed: number | undefined;

    // Call the appropriate provider
    switch (selectedProvider) {
      case "gemini":
        content = await generateWithGemini(prompt);
        break;
      case "openai":
        content = await generateWithOpenAI(prompt);
        break;
      default:
        throw new Error(`Unknown provider: ${selectedProvider}`);
    }

    const responseTime = Date.now() - startTime;
    const cost = tokensUsed ? tokensUsed * providerConfig.costPerToken : undefined;

    return {
      content,
      provider: selectedProvider,
      model: providerConfig.defaultModel,
      tokensUsed,
      cost,
      responseTime,
    };
  } catch (error: any) {
    console.error(`❌ ${providerConfig.name} failed:`, error.message);

    // Fallback logic: try other providers
    const availableProviders = await getAvailableProviders();
    const fallbackProviders = availableProviders.filter(p => p !== selectedProvider);

    if (fallbackProviders.length > 0) {
      console.log(`🔄 Falling back to ${fallbackProviders[0]}`);
      
      // Try fallback provider
      const fallbackProvider = fallbackProviders[0];
      const fallbackConfig = getProviderConfig(fallbackProvider);
      
      try {
        let content: string;
        
        switch (fallbackProvider) {
          case "gemini":
            content = await generateWithGemini(prompt);
            break;
          case "openai":
            content = await generateWithOpenAI(prompt);
            break;
          default:
            throw new Error(`Unknown fallback provider: ${fallbackProvider}`);
        }

        const responseTime = Date.now() - startTime;

        return {
          content,
          provider: fallbackProvider,
          model: fallbackConfig.defaultModel,
          responseTime,
        };
      } catch (fallbackError: any) {
        console.error(`❌ Fallback ${fallbackProvider} also failed:`, fallbackError.message);
        throw new Error(`All LLM providers failed. Last error: ${fallbackError.message}`);
      }
    }

    // No fallback available
    throw new Error(`Primary provider failed and no fallback available: ${error.message}`);
  }
}

// Convenience functions for specific use cases
export async function generateCampaignContent(prompt: string, provider?: LLMProvider) {
  return generateWithLLM(prompt, { 
    provider: provider || "auto",
    temperature: 0.7,
    maxTokens: 2000,
  });
}

export async function generateQuizQuestions(topic: string, bloomLevel: number, provider?: LLMProvider) {
  const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
  
  const prompt = `Create 5 quiz questions about "${topic}" at the ${bloomLevels[bloomLevel - 1]} level of Bloom's Taxonomy. 

Format as JSON with this structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Make sure the JSON is valid and properly formatted.`;

  return generateWithLLM(prompt, { 
    provider: provider || "auto",
    temperature: 0.5,
    maxTokens: 1500,
  });
}

export async function generateMilestoneObjective(
  topic: string,
  bloomLevel: number,
  focusAreas: string[],
  provider?: LLMProvider
) {
  const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
  
  const prompt = `Create a learning objective for "${topic}" at the ${bloomLevels[bloomLevel - 1]} level of Bloom's Taxonomy.

Focus areas: ${focusAreas.join(", ")}

The objective should be:
- Clear and measurable
- Appropriate for the Bloom's level
- Engaging and motivating
- Include specific learning outcomes

Format as JSON:
{
  "objective": "Clear learning objective here",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
  "assessmentCriteria": "How to measure success"
}`;

  return generateWithLLM(prompt, { 
    provider: provider || "auto",
    temperature: 0.6,
    maxTokens: 1000,
  });
}

export async function generateExternalResources(
  topic: string,
  resourceTypes: string[],
  provider?: LLMProvider
) {
  const prompt = `Suggest 5 high-quality external resources for learning about "${topic}".

Resource types to prioritize: ${resourceTypes.join(", ")}

Format as JSON:
{
  "resources": [
    {
      "title": "Resource title",
      "url": "https://example.com",
      "type": "article|video|tutorial|course",
      "description": "Brief description",
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}`;

  return generateWithLLM(prompt, { 
    provider: provider || "auto",
    temperature: 0.5,
    maxTokens: 1200,
  });
}
