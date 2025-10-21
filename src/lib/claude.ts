import Anthropic from "@anthropic-ai/sdk";

// Support Claude AI
const createClaudeClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required");
  }

  return new Anthropic({
    apiKey,
  });
};

export const claude = createClaudeClient();

// Helper function for generating campaign content
export async function generateCampaignContent(prompt: string) {
  try {
    const message = await claude.messages.create({
      model: "claude-3-haiku-20240307", // Fast and cheap model
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return message.content[0]?.text || "";
  } catch (error: any) {
    console.error("Error generating content:", error);

    // Provide more specific error messages
    if (error.message?.includes("quota")) {
      throw new Error("Claude API quota exceeded. Please check your billing.");
    } else if (error.message?.includes("API key")) {
      throw new Error(
        "Invalid Claude API key. Please check your configuration.",
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
    const message = await claude.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0]?.text || "";

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
    const message = await claude.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0]?.text || "";

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
    const message = await claude.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0]?.text || "";

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

