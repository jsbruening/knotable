import Groq from "groq-sdk";

// Support for Groq API
const createGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is required");
  }

  return new Groq({
    apiKey,
  });
};

export const groq = createGroqClient();

// Helper function for generating campaign content with Groq
export async function generateCampaignContentWithGroq(prompt: string) {
  try {
    const completion = await groq.chat.completions.create({
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
      model: "llama-3.1-70b-versatile", // Fast and capable model
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("Error generating content with Groq:", error);

    // Provide more specific error messages
    if (error.code === "model_not_found") {
      throw new Error(
        "Groq model not found. Please check your API access or try a different model.",
      );
    } else if (error.code === "insufficient_quota") {
      throw new Error("Groq API quota exceeded. Please check your billing.");
    } else if (error.code === "invalid_api_key") {
      throw new Error(
        "Invalid Groq API key. Please check your configuration.",
      );
    }

    throw new Error(
      `Failed to generate content with Groq: ${error.message || "Unknown error"}`,
    );
  }
}

// Helper function for generating quiz questions with Groq
export async function generateQuizQuestionsWithGroq(topic: string, bloomLevel: number) {
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
    const completion = await groq.chat.completions.create({
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
      model: "llama-3.1-70b-versatile",
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
    console.error("Error generating quiz with Groq:", error);
    throw new Error("Failed to generate quiz questions with Groq");
  }
}

// Helper function for generating milestone objectives with Groq
export async function generateMilestoneObjectiveWithGroq(
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
    const completion = await groq.chat.completions.create({
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
      model: "llama-3.1-70b-versatile",
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
    console.error("Error generating objective with Groq:", error);
    throw new Error("Failed to generate milestone objective with Groq");
  }
}

// Helper function for generating external resources with Groq
export async function generateExternalResourcesWithGroq(
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
    const completion = await groq.chat.completions.create({
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
      model: "llama-3.1-70b-versatile",
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
    console.error("Error generating resources with Groq:", error);
    throw new Error("Failed to generate external resources with Groq");
  }
}
