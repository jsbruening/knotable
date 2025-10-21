import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function testCampaignGeneration() {
  console.log("🔍 Testing Campaign Content Generation");
  console.log("=====================================");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("❌ No GEMINI_API_KEY found in .env file");
    return;
  }

  try {
    const gemini = new GoogleGenAI({ apiKey });

    // Test with a simple campaign prompt
    const prompt = `You are an expert educational content creator specializing in Bloom's Taxonomy. Create a comprehensive learning campaign.

CAMPAIGN DETAILS:
- Title: "Learn React Basics"
- Topic: React
- Description: Introduction to React fundamentals
- Target Audience: General learners
- Starting Bloom Level: 1 (Remember)
- Target Bloom Level: 3 (Apply)
- Focus Areas: Components, State, Props
- Estimated Duration: 7 days
- Tone: professional

LEARNING PARAMETERS:
- Learning Style: Mixed
- Difficulty Preference: Balanced
- Content Format: Mixed
- Time Commitment: Flexible
- Prerequisites: Basic JavaScript knowledge

TASK:
Create a structured learning path with 3 milestones that progress through Bloom's Taxonomy levels 1 to 3.

For each milestone, provide:
1. A clear, engaging title
2. A specific learning objective appropriate for the Bloom level
3. 3-5 high-quality external resources (real URLs when possible)
4. Estimated time to complete

Also create 2-3 assessment questions per milestone to verify understanding.

RESPONSE FORMAT (must be valid JSON):
{
  "milestones": [
    {
      "bloomLevel": 1,
      "title": "Engaging milestone title",
      "objective": "Specific, measurable learning objective",
      "resources": [
        "https://real-resource-url.com",
        "https://another-resource.com"
      ],
      "estimatedTime": "2-3 hours"
    }
  ],
  "assessmentQuestions": [
    {
      "milestoneIndex": 0,
      "question": "Clear, well-written question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this answer is correct"
    }
  ]
}

IMPORTANT: 
- Use real, high-quality educational resources when possible
- Make objectives specific and measurable
- Ensure questions test the appropriate Bloom level
- Keep the JSON structure exactly as specified
- Make content engaging and practical`;

    console.log("\n🧪 Testing campaign content generation...");

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log("✅ SUCCESS!");
    console.log("Response length:", response.text.length);
    console.log("\n📝 First 500 characters of response:");
    console.log(response.text.substring(0, 500));

    // Try to parse the JSON
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("\n✅ JSON parsing successful!");
        console.log("Milestones count:", parsed.milestones?.length || 0);
        console.log(
          "Assessment questions count:",
          parsed.assessmentQuestions?.length || 0,
        );
      } else {
        console.log("\n❌ No JSON found in response");
      }
    } catch (parseError) {
      console.log("\n❌ JSON parsing failed:", parseError.message);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    console.log("Error details:", error);
  }
}

testCampaignGeneration().catch(console.error);
