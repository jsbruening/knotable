import OpenAI from "openai";

// Support both OpenAI and Azure OpenAI
const createOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiBase = process.env.OPENAI_API_BASE;
  const apiVersion = process.env.OPENAI_API_VERSION;
  const deploymentName = process.env.OPENAI_DEPLOYMENT_NAME || "gpt-4";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  // If apiBase is provided, use Azure OpenAI
  if (apiBase) {
    return new OpenAI({
      apiKey,
      baseURL: `${apiBase}/openai/deployments/${deploymentName}`,
      defaultQuery: { "api-version": apiVersion || "2024-02-15-preview" },
      defaultHeaders: {
        "api-key": apiKey,
      },
    });
  }

  // Otherwise, use standard OpenAI
  return new OpenAI({
    apiKey,
  });
};

export const openai = createOpenAIClient();

// Helper function for generating campaign content
export async function generateCampaignContent(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_API_BASE ? deploymentName : "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational content creator specializing in Bloom's Taxonomy. Create engaging, structured learning content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("Error generating content:", error);

    // Provide more specific error messages
    if (error.code === "model_not_found") {
      throw new Error(
        "OpenAI model not found. Please check your API access or try a different model.",
      );
    } else if (error.code === "insufficient_quota") {
      throw new Error("OpenAI API quota exceeded. Please check your billing.");
    } else if (error.code === "invalid_api_key") {
      throw new Error(
        "Invalid OpenAI API key. Please check your configuration.",
      );
    }

    throw new Error(
      `Failed to generate content: ${error.message || "Unknown error"}`,
    );
  }
}

// Helper function for generating quiz questions
export async function generateQuizQuestions(topic: string, bloomLevel: number) {
  const bloomLevels = [
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ];

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

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_API_BASE ? deploymentName : "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert quiz creator. Always respond with valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("No valid JSON found in response");
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

// Helper function for generating milestone objectives
export async function generateMilestoneObjective(
  topic: string,
  bloomLevel: number,
  focusAreas: string[],
) {
  const bloomLevels = [
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ];

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

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_API_BASE ? deploymentName : "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational content creator. Always respond with valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("No valid JSON found in response");
  } catch (error) {
    console.error("Error generating objective:", error);
    throw new Error("Failed to generate milestone objective");
  }
}

// Helper function for generating external resources
export async function generateExternalResources(
  topic: string,
  resourceTypes: string[],
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

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_API_BASE ? deploymentName : "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational resource curator. Always respond with valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1200,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("No valid JSON found in response");
  } catch (error) {
    console.error("Error generating resources:", error);
    throw new Error("Failed to generate external resources");
  }
}
