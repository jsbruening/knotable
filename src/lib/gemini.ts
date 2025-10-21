import { GoogleGenAI } from "@google/genai";

// Support Gemini AI (Direct API - no Vertex AI required!)
const createGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required");
  }

  // Use direct Gemini API (not Vertex AI)
  return new GoogleGenAI({ apiKey });
};

export const gemini = createGeminiClient();

// Helper function for generating campaign content
export async function generateCampaignContent(prompt: string) {
  try {
    // Use the correct model name from Google AI Studio docs
    const modelName = "gemini-2.5-flash";
    console.log(`Using Gemini model: ${modelName}`);

    const response = await gemini.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    console.log(`✅ Success with model: ${modelName}`);
    return response.text;
  } catch (error: any) {
    console.error("Error generating content:", error);

    // Provide more specific error messages
    if (error.message?.includes("quota")) {
      throw new Error("Gemini API quota exceeded. Please check your billing.");
    } else if (error.message?.includes("API key")) {
      throw new Error(
        "Invalid Gemini API key. Please check your configuration.",
      );
    } else if (error.message?.includes("404")) {
      throw new Error(
        "Gemini API not enabled. Please enable Vertex AI API in Google Cloud Console.",
      );
    } else if (error.message?.includes("403")) {
      throw new Error(
        "Gemini API access denied. Please check your API key permissions.",
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
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const content = response.text;

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
    // Try different model names in order of preference
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;

    for (const modelName of models) {
      try {
        const model = gemini.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
          {
            text: prompt,
          },
        ]);

        const response = await result.response;
        const content = response.text();

        // Extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }

        throw new Error("No valid JSON found in response");
      } catch (modelError: any) {
        lastError = modelError;
        continue;
      }
    }

    throw lastError;
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
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        text: prompt,
      },
    ]);

    const response = await result.response;
    const content = response.text();

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
