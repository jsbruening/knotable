import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { 
  generateCampaignContent, 
  generateMilestoneObjective, 
  generateExternalResources,
  generateQuizQuestions 
} from "~/lib/openai";

export const adminRouter = createTRPCRouter({
  // Create campaign with AI assistance
  createCampaignWithAI: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      description: z.string().min(1),
      targetAudience: z.string().optional(),
      startingBloomLevel: z.number().min(1).max(6).default(1),
      targetBloomLevel: z.number().min(1).max(6).default(6),
      focusAreas: z.array(z.string()).default([]),
      resourceTypes: z.array(z.string()).default([]),
      excludedSources: z.array(z.string()).default([]),
      tone: z.string().optional(),
      estimatedDuration: z.number().optional(),
      challengeType: z.string().optional(),
      teamChallengeIdeas: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        // Generate campaign content with Gemini
        const prompt = `Create a comprehensive learning campaign for "${input.topic}".

Target audience: ${input.targetAudience || "General learners"}
Bloom's Taxonomy levels: ${input.startingBloomLevel} to ${input.targetBloomLevel}
Focus areas: ${input.focusAreas.join(', ') || "Core concepts"}
Resource types: ${input.resourceTypes.join(', ') || "Mixed"}
Tone: ${input.tone || "Engaging and educational"}
Estimated duration: ${input.estimatedDuration || "Self-paced"} days

Create a detailed campaign structure with milestones, objectives, and learning path.`;

        const campaignContent = await generateCampaignContent(prompt);

        // Create the campaign
        const campaign = await ctx.db.campaign.create({
          data: {
            title: `${input.topic} Learning Campaign`,
            description: input.description,
            topic: input.topic,
            targetAudience: input.targetAudience,
            startingBloomLevel: input.startingBloomLevel,
            targetBloomLevel: input.targetBloomLevel,
            focusAreas: input.focusAreas,
            resourceTypes: input.resourceTypes,
            excludedSources: input.excludedSources,
            tone: input.tone,
            estimatedDuration: input.estimatedDuration,
            challengeType: input.challengeType,
            teamChallengeIdeas: input.teamChallengeIdeas,
            createdById: ctx.user.id,
          },
        });

        // Generate milestones for each Bloom's level
        const milestones = [];
        for (let level = input.startingBloomLevel; level <= input.targetBloomLevel; level++) {
          const objectiveData = await generateMilestoneObjective(
            input.topic,
            level,
            input.focusAreas
          );

          const resourcesData = await generateExternalResources(
            input.topic,
            input.resourceTypes
          );

          const milestone = await ctx.db.milestone.create({
            data: {
              campaignId: campaign.id,
              bloomLevel: level,
              title: `${input.topic} - Level ${level}`,
              objective: objectiveData.objective,
              externalResources: resourcesData.resources.map((r: any) => r.url),
              order: level - input.startingBloomLevel + 1,
            },
          });

          // Generate quiz for this milestone
          const quizData = await generateQuizQuestions(input.topic, level);
          
          await ctx.db.quiz.create({
            data: {
              milestoneId: milestone.id,
              title: `${input.topic} - Level ${level} Quiz`,
              questions: quizData,
              passingScore: 70,
              timeLimit: 30, // 30 minutes
            },
          });

          milestones.push(milestone);
        }

        return {
          campaign,
          milestones,
          aiGeneratedContent: campaignContent,
        };
      } catch (error) {
        console.error("Error creating campaign with AI:", error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to create campaign with AI assistance" 
        });
      }
    }),

  // Generate additional content for existing campaign
  generateCampaignContent: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
      contentType: z.enum(["milestone_objective", "external_resources", "quiz_questions"]),
      milestoneId: z.string().optional(),
      bloomLevel: z.number().min(1).max(6).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      try {
        switch (input.contentType) {
          case "milestone_objective":
            if (!input.bloomLevel) {
              throw new TRPCError({ code: "BAD_REQUEST", message: "Bloom level required for objective generation" });
            }
            return await generateMilestoneObjective(campaign.topic, input.bloomLevel, campaign.focusAreas);

          case "external_resources":
            return await generateExternalResources(campaign.topic, campaign.resourceTypes);

          case "quiz_questions":
            if (!input.bloomLevel) {
              throw new TRPCError({ code: "BAD_REQUEST", message: "Bloom level required for quiz generation" });
            }
            return await generateQuizQuestions(campaign.topic, input.bloomLevel);

          default:
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid content type" });
        }
      } catch (error) {
        console.error("Error generating content:", error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to generate content" 
        });
      }
    }),

  // Get admin dashboard stats
  getAdminStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.isAdmin) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    const [
      totalUsers,
      totalCampaigns,
      totalTeams,
      recentUsers,
      recentCampaigns,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.campaign.count(),
      ctx.db.team.count(),
      ctx.db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, displayName: true, email: true, createdAt: true },
      }),
      ctx.db.campaign.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { displayName: true, email: true } },
          _count: { select: { users: true } },
        },
      }),
    ]);

    return {
      totalUsers,
      totalCampaigns,
      totalTeams,
      recentUsers,
      recentCampaigns,
    };
  }),
});
