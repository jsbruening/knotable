import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import fetch from "node-fetch";
import { generateCampaignContent } from "~/lib/gemini";
import { discoverResourcesForMilestone, discoverResourcesForLesson } from "~/lib/resource-discovery";

// Helper function to build AI prompt for campaign generation
function buildCampaignPrompt(campaign: any, params: any): string {
  return `
You are an expert educational content creator specializing in Bloom's Taxonomy. Create a comprehensive learning campaign.

CAMPAIGN DETAILS:
- Title: "${campaign.title}"
- Topic: ${campaign.topic}
- Description: ${campaign.description}
- Target Audience: ${campaign.targetAudience || "General learners"}
- Starting Bloom Level: ${campaign.startingBloomLevel} (${getBloomLevelName(campaign.startingBloomLevel)})
- Target Bloom Level: ${campaign.targetBloomLevel} (${getBloomLevelName(campaign.targetBloomLevel)})
- Focus Areas: ${campaign.focusAreas.join(", ")}
- Estimated Duration: ${campaign.estimatedDuration || "Flexible"} days
- Tone: ${campaign.tone || "professional"}

LEARNING PARAMETERS:
- Learning Style: ${params.learningStyle || "Mixed"}
- Difficulty Preference: ${params.difficultyPreference || "Balanced"}
- Content Format: ${params.contentFormat || "Mixed"}
- Time Commitment: ${params.timeCommitment || "Flexible"}
- Prerequisites: ${params.prerequisites || "None specified"}

TASK:
Create a structured learning path with ${Math.max(3, campaign.targetBloomLevel - campaign.startingBloomLevel + 1)} milestones that progress through Bloom's Taxonomy levels ${campaign.startingBloomLevel} to ${campaign.targetBloomLevel}.

For each milestone, provide:
1. A clear, engaging title that reflects the Bloom level
2. A specific, measurable learning objective appropriate for the Bloom level
3. 3-5 high-quality external resources (use REAL URLs when possible - official docs, MDN, FreeCodeCamp, YouTube tutorials, etc.)
4. Estimated time to complete
5. 3-5 sub-milestones that break down the main milestone into smaller, manageable learning units
6. 2-3 assessment questions that test understanding at the appropriate Bloom level

Each sub-milestone should have:
- A specific, focused title
- A clear learning objective
- 2-3 high-quality external resources
- Estimated time to complete (typically 1-3 hours)
- 1-2 assessment questions appropriate for the sub-milestone level

BLOOM'S TAXONOMY GUIDANCE:
- Level 1 (Remember): Recall facts, terms, basic concepts
- Level 2 (Understand): Explain ideas, compare, summarize
- Level 3 (Apply): Use knowledge in new situations, solve problems
- Level 4 (Analyze): Break down complex topics, find patterns
- Level 5 (Evaluate): Make judgments, defend decisions, critique
- Level 6 (Create): Design, construct, produce original work

RESPONSE FORMAT (must be valid JSON):
{
  "milestones": [
    {
      "bloomLevel": 1,
      "title": "Specific, engaging milestone title",
      "objective": "Specific, measurable learning objective appropriate for this Bloom level",
      "resources": [
        "https://real-official-docs-url.com",
        "https://real-tutorial-url.com",
        "https://real-video-url.com"
      ],
      "estimatedTime": "X-Y hours",
      "subMilestones": [
        {
          "title": "Specific sub-milestone title",
          "objective": "Clear learning objective for this sub-milestone",
          "resources": [
            "https://real-resource-url.com",
            "https://real-tutorial-url.com"
          ],
          "estimatedTime": "1-2 hours",
          "assessmentQuestions": [
            {
              "question": "Context-specific question for this sub-milestone",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": "A",
              "explanation": "Detailed explanation of why this answer is correct"
            }
          ]
        }
      ],
      "assessmentQuestions": [
        {
          "question": "Context-specific question that tests this Bloom level",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "A",
          "explanation": "Detailed explanation of why this answer is correct and what it demonstrates"
        }
      ]
    }
  ]
}

IMPORTANT: 
- Use REAL, high-quality educational resources (official docs, MDN, FreeCodeCamp, YouTube, etc.)
- Make objectives specific and measurable for the Bloom level
- Ensure questions test the appropriate Bloom level with real-world scenarios
- Keep the JSON structure exactly as specified
- Make content engaging, practical, and progressive
- Each milestone should build on the previous one
`;
}

function getBloomLevelName(level: number): string {
  const levels = [
    "",
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ];
  return levels[level] || "Unknown";
}

export const campaignRouter = createTRPCRouter({
  // Discover and add fresh resources for a milestone
  refreshResources: protectedProcedure
    .input(
      z.object({
        milestoneId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const milestone = await ctx.db.milestone.findUnique({
        where: { id: input.milestoneId },
        include: {
          campaign: true,
          lessons: true,
        },
      });

      if (!milestone) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Milestone not found" });
      }

      const { campaign } = milestone;

      // Discover resources for the main milestone
      const milestoneResources = await discoverResourcesForMilestone({
        topic: campaign.topic,
        milestoneTitle: milestone.title,
        milestoneObjective: milestone.objective,
        bloomLevel: milestone.bloomLevel,
        focusAreas: campaign.focusAreas,
        resourceTypes: campaign.resourceTypes || [],
      });

      // Discover resources for each lesson
      const lessonResources = await Promise.all(
        milestone.lessons.map(async (lesson) => {
          const resources = await discoverResourcesForLesson({
            topic: campaign.topic,
            milestoneTitle: milestone.title,
            milestoneObjective: milestone.objective,
            bloomLevel: milestone.bloomLevel,
            focusAreas: campaign.focusAreas,
            resourceTypes: campaign.resourceTypes || [],
            lessonTitle: lesson.title,
            lessonObjective: lesson.objective,
          });
          return { lessonId: lesson.id, resources };
        })
      );

      // Validate and save main milestone resources
      const validatedMilestoneResources = await Promise.all(
        milestoneResources.map(async (resource) => {
          try {
            // Quick HEAD request to validate URL
            const response = await fetch(resource.url, { 
              method: "HEAD", 
              redirect: "follow", 
              timeout: 5000 as any 
            });
            const isAlive = response.status >= 200 && response.status < 400;

            return await ctx.db.resource.upsert({
              where: {
                milestoneId_url: { 
                  milestoneId: milestone.id, 
                  url: resource.url 
                },
              },
              update: {
                type: resource.type,
                title: resource.title,
                provider: resource.provider,
                isAlive,
                lastCheckedAt: new Date(),
              },
              create: {
                milestoneId: milestone.id,
                url: resource.url,
                type: resource.type,
                title: resource.title,
                provider: resource.provider,
                isAlive,
                lastCheckedAt: new Date(),
              },
            });
          } catch (error) {
            console.error(`Error validating resource ${resource.url}:`, error);
            return await ctx.db.resource.upsert({
              where: {
                milestoneId_url: { 
                  milestoneId: milestone.id, 
                  url: resource.url 
                },
              },
              update: {
                type: resource.type,
                title: resource.title,
                provider: resource.provider,
                isAlive: false,
                lastCheckedAt: new Date(),
              },
              create: {
                milestoneId: milestone.id,
                url: resource.url,
                type: resource.type,
                title: resource.title,
                provider: resource.provider,
                isAlive: false,
                lastCheckedAt: new Date(),
              },
            });
          }
        })
      );

      // Validate and save lesson resources (save to individual lessons)
      const validatedLessonResources = await Promise.all(
        lessonResources.flatMap(({ lessonId, resources }) =>
          resources.map(async (resource) => {
            try {
              const response = await fetch(resource.url, { 
                method: "HEAD", 
                redirect: "follow", 
                timeout: 5000 as any 
              });
              const isAlive = response.status >= 200 && response.status < 400;

              return await ctx.db.resource.upsert({
                where: {
                  lessonId_url: { 
                    lessonId: lessonId, 
                    url: resource.url 
                  },
                },
                update: {
                  type: resource.type,
                  title: resource.title,
                  provider: resource.provider,
                  isAlive,
                  lastCheckedAt: new Date(),
                },
                create: {
                  lessonId: lessonId,
                  url: resource.url,
                  type: resource.type,
                  title: resource.title,
                  provider: resource.provider,
                  isAlive,
                  lastCheckedAt: new Date(),
                },
              });
            } catch (error) {
              console.error(`Error validating lesson resource ${resource.url}:`, error);
              return await ctx.db.resource.upsert({
                where: {
                  lessonId_url: { 
                    lessonId: lessonId, 
                    url: resource.url 
                  },
                },
                update: {
                  type: resource.type,
                  title: resource.title,
                  provider: resource.provider,
                  isAlive: false,
                  lastCheckedAt: new Date(),
                },
                create: {
                  lessonId: lessonId,
                  url: resource.url,
                  type: resource.type,
                  title: resource.title,
                  provider: resource.provider,
                  isAlive: false,
                  lastCheckedAt: new Date(),
                },
              });
            }
          })
        )
      );

      const allResources = [...validatedMilestoneResources, ...validatedLessonResources];
      const liveResources = allResources.filter(r => r.isAlive);

      return { 
        success: true,
        message: `Discovered ${allResources.length} resources (${liveResources.length} live)`,
        totalResources: allResources.length,
        liveResources: liveResources.length,
        deadResources: allResources.length - liveResources.length,
        resources: liveResources
      };
    }),
  // Get all public campaigns
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const campaigns = await ctx.db.campaign.findMany({
        where: { isPublic: true, isActive: true },
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (campaigns.length > input.limit) {
        const nextItem = campaigns.pop();
        nextCursor = nextItem?.id;
      }

      return {
        campaigns,
        nextCursor,
      };
    }),

  // Get campaign by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.id },
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          milestones: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                include: {
                  quizzes: true,
                  resources: true,
                },
              },
              quizzes: true,
              resources: true,
            },
          },
          _count: {
            select: { users: true },
          },
        },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      // Check if current user is enrolled (if authenticated)
      let isUserEnrolled = false;
      if (ctx.user) {
        const userCampaign = await ctx.db.userCampaign.findUnique({
          where: {
            userId_campaignId: {
              userId: ctx.user.id,
              campaignId: input.id,
            },
          },
        });
        isUserEnrolled = !!userCampaign;
      }

      return {
        ...campaign,
        isUserEnrolled,
      };
    }),

  // Join a campaign
  join: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (!campaign.isPublic) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Campaign is not public",
        });
      }

      // Check if user is already in the campaign
      const existingMembership = await ctx.db.userCampaign.findUnique({
        where: {
          userId_campaignId: {
            userId: ctx.user.id,
            campaignId: input.campaignId,
          },
        },
      });

      if (existingMembership) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already joined this campaign",
        });
      }

      return ctx.db.userCampaign.create({
        data: {
          userId: ctx.user.id,
          campaignId: input.campaignId,
        },
        include: {
          campaign: true,
        },
      });
    }),

  // Leave a campaign
  leave: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.userCampaign.findUnique({
        where: {
          userId_campaignId: {
            userId: ctx.user.id,
            campaignId: input.campaignId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not a member of this campaign",
        });
      }

      return ctx.db.userCampaign.delete({
        where: { id: membership.id },
      });
    }),

  // Get user's campaigns
  getUserCampaigns: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userCampaign.findMany({
      where: { userId: ctx.user.id },
      include: {
        campaign: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
            _count: {
              select: { users: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
  }),

  // Create a new campaign draft (admin only)
  createDraft: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        topic: z.string().min(1),
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
        teamId: z.string().optional(), // For team-scoped campaigns
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      return ctx.db.campaign.create({
        data: {
          ...input,
          createdById: ctx.user.id,
          isDraft: true,
          isPublic: !input.teamId, // If teamId provided, make it private to that team
        },
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          team: input.teamId
            ? {
                select: { id: true, name: true },
              }
            : undefined,
        },
      });
    }),

  // Generate campaign content using AI
  generateContent: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        learningStyle: z.string().optional(),
        difficultyPreference: z.string().optional(),
        contentFormat: z.string().optional(),
        timeCommitment: z.string().optional(),
        prerequisites: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      // For temporary campaign generation, we'll use a mock campaign object
      // This allows us to generate content without creating a database record first
      const mockCampaign = {
        title: "Temporary Campaign",
        topic: "General",
        description: "Temporary description",
        targetAudience: "General learners",
        startingBloomLevel: 1,
        targetBloomLevel: 3,
        focusAreas: [],
        estimatedDuration: 7,
        tone: "professional",
      };

      // Build the AI prompt
      const prompt = buildCampaignPrompt(mockCampaign, input);

      try {
        // Call Gemini API
        const aiResponse = await generateCampaignContent(prompt);

        // Parse the AI response
        let generatedContent;
        try {
          // Extract JSON from the response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            generatedContent = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No valid JSON found in AI response");
          }
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          console.error("AI Response:", aiResponse);

          // Fallback to mock data if parsing fails - create multiple milestones
          const milestoneCount = Math.max(
            3,
            mockCampaign.targetBloomLevel - mockCampaign.startingBloomLevel + 1,
          );
          const milestones = [];

          for (let i = 0; i < milestoneCount; i++) {
            const currentLevel = Math.min(
              mockCampaign.startingBloomLevel + i,
              mockCampaign.targetBloomLevel,
            );
            const levelNames = [
              "",
              "Remember",
              "Understand",
              "Apply",
              "Analyze",
              "Evaluate",
              "Create",
            ];

            milestones.push({
              bloomLevel: currentLevel,
              title: `${levelNames[currentLevel]} Level: ${mockCampaign.topic} ${i + 1}`,
              objective: `Learn to ${levelNames[currentLevel]?.toLowerCase() || "understand"} ${mockCampaign.topic} concepts at level ${currentLevel}`,
              resources: [
                `https://example.com/${mockCampaign.topic}-level-${currentLevel}`,
                `https://youtube.com/watch?v=${mockCampaign.topic}-${levelNames[currentLevel]?.toLowerCase() || "understand"}`,
                `https://docs.example.com/${mockCampaign.topic}/level-${currentLevel}`,
              ],
              estimatedTime: `${2 + i} hours`,
              subMilestones: [
                {
                  title: `Sub-milestone ${i + 1}.1: Introduction to ${mockCampaign.topic}`,
                  objective: `Understand basic concepts of ${mockCampaign.topic}`,
                  resources: [
                    `https://example.com/${mockCampaign.topic}-intro`,
                    `https://youtube.com/watch?v=${mockCampaign.topic}-basics`,
                  ],
                  estimatedTime: "1-2 hours",
                  assessmentQuestions: [
                    {
                      question: `What is the primary purpose of ${mockCampaign.topic}?`,
                      options: ["Option A", "Option B", "Option C", "Option D"],
                      correctAnswer: "A",
                      explanation:
                        "This demonstrates basic understanding of the topic.",
                    },
                  ],
                },
                {
                  title: `Sub-milestone ${i + 1}.2: Practical Application`,
                  objective: `Apply ${mockCampaign.topic} concepts in practice`,
                  resources: [
                    `https://example.com/${mockCampaign.topic}-practice`,
                    `https://youtube.com/watch?v=${mockCampaign.topic}-hands-on`,
                  ],
                  estimatedTime: "2-3 hours",
                  assessmentQuestions: [
                    {
                      question: `How would you implement ${mockCampaign.topic} in a real project?`,
                      options: ["Option A", "Option B", "Option C", "Option D"],
                      correctAnswer: "B",
                      explanation:
                        "This shows practical application knowledge.",
                    },
                  ],
                },
              ],
              assessmentQuestions: [
                {
                  question: `What is the main concept covered in milestone ${i + 1}?`,
                  options: ["Option A", "Option B", "Option C", "Option D"],
                  correctAnswer: "A",
                  explanation:
                    "This answer demonstrates understanding of the milestone content.",
                },
              ],
            });
          }

          generatedContent = {
            milestones,
          };
        }

        return generatedContent;
      } catch (aiError) {
        console.error("Error calling Gemini API:", aiError);

        // Fallback to mock data if AI call fails - create multiple milestones
        const milestoneCount = Math.max(
          3,
          mockCampaign.targetBloomLevel - mockCampaign.startingBloomLevel + 1,
        );
        const milestones = [];

        for (let i = 0; i < milestoneCount; i++) {
          const currentLevel = Math.min(
            mockCampaign.startingBloomLevel + i,
            mockCampaign.targetBloomLevel,
          );
          const levelNames = [
            "",
            "Remember",
            "Understand",
            "Apply",
            "Analyze",
            "Evaluate",
            "Create",
          ];

          milestones.push({
            bloomLevel: currentLevel,
            title: `${levelNames[currentLevel]} Level: ${mockCampaign.topic} ${i + 1}`,
            objective: `Learn to ${levelNames[currentLevel]?.toLowerCase() || "understand"} ${mockCampaign.topic} concepts at level ${currentLevel}`,
            resources: [
              `https://example.com/${mockCampaign.topic}-level-${currentLevel}`,
              `https://youtube.com/watch?v=${mockCampaign.topic}-${levelNames[currentLevel]?.toLowerCase() || "understand"}`,
              `https://docs.example.com/${mockCampaign.topic}/level-${currentLevel}`,
            ],
            estimatedTime: `${2 + i} hours`,
            subMilestones: [
              {
                title: `Sub-milestone ${i + 1}.1: Introduction to ${mockCampaign.topic}`,
                objective: `Understand basic concepts of ${mockCampaign.topic}`,
                resources: [
                  `https://example.com/${mockCampaign.topic}-intro`,
                  `https://youtube.com/watch?v=${mockCampaign.topic}-basics`,
                ],
                estimatedTime: "1-2 hours",
                assessmentQuestions: [
                  {
                    question: `What is the primary purpose of ${mockCampaign.topic}?`,
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    correctAnswer: "A",
                    explanation:
                      "This demonstrates basic understanding of the topic.",
                  },
                ],
              },
              {
                title: `Sub-milestone ${i + 1}.2: Practical Application`,
                objective: `Apply ${mockCampaign.topic} concepts in practice`,
                resources: [
                  `https://example.com/${mockCampaign.topic}-practice`,
                  `https://youtube.com/watch?v=${mockCampaign.topic}-hands-on`,
                ],
                estimatedTime: "2-3 hours",
                assessmentQuestions: [
                  {
                    question: `How would you implement ${mockCampaign.topic} in a real project?`,
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    correctAnswer: "B",
                    explanation: "This shows practical application knowledge.",
                  },
                ],
              },
            ],
            assessmentQuestions: [
              {
                question: `What is the main concept covered in milestone ${i + 1}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: "A",
                explanation:
                  "This answer demonstrates understanding of the milestone content.",
              },
            ],
          });
        }

        return {
          milestones,
        };
      }
    }),

  // Update campaign draft
  updateDraft: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        topic: z.string().min(1).optional(),
        targetAudience: z.string().optional(),
        startingBloomLevel: z.number().min(1).max(6).optional(),
        targetBloomLevel: z.number().min(1).max(6).optional(),
        focusAreas: z.array(z.string()).optional(),
        resourceTypes: z.array(z.string()).optional(),
        excludedSources: z.array(z.string()).optional(),
        tone: z.string().optional(),
        estimatedDuration: z.number().optional(),
        challengeType: z.string().optional(),
        teamChallengeIdeas: z.string().optional(),
        teamId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const { id, ...updateData } = input;

      // Check if user owns this campaign
      const campaign = await ctx.db.campaign.findUnique({
        where: { id },
        select: { createdById: true },
      });

      if (!campaign || campaign.createdById !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to modify this campaign",
        });
      }

      return ctx.db.campaign.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          team: updateData.teamId
            ? {
                select: { id: true, name: true },
              }
            : undefined,
        },
      });
    }),

  // Publish campaign (convert from draft to published)
  publish: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      // Check if user owns this campaign
      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.id },
        select: { createdById: true },
      });

      if (!campaign || campaign.createdById !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to modify this campaign",
        });
      }

      return ctx.db.campaign.update({
        where: { id: input.id },
        data: {
          isDraft: false,
          isActive: true,
        },
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          team: {
            select: { id: true, name: true },
          },
        },
      });
    }),

  // Delete campaign (admin only)
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.id },
        select: { createdById: true },
      });

      if (!campaign || campaign.createdById !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this campaign",
        });
      }

      // Delete related records first (due to foreign key constraints)
      await ctx.db.milestone.deleteMany({
        where: { campaignId: input.id },
      });

      await ctx.db.userCampaign.deleteMany({
        where: { campaignId: input.id },
      });

      await ctx.db.teamChallenge.deleteMany({
        where: { campaignId: input.id },
      });

      // Delete the campaign
      await ctx.db.campaign.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Create milestones from generated content
  createMilestones: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        milestones: z.array(
          z.object({
            bloomLevel: z.number(),
            title: z.string(),
            objective: z.string(),
            resources: z.array(z.string()),
            estimatedTime: z.string().optional(),
            subMilestones: z
              .array(
                z.object({
                  title: z.string(),
                  objective: z.string(),
                  resources: z.array(z.string()),
                  estimatedTime: z.string().optional(),
                  assessmentQuestions: z
                    .array(
                      z.object({
                        question: z.string(),
                        options: z.array(z.string()),
                        correctAnswer: z.string(),
                        explanation: z.string().optional(),
                      }),
                    )
                    .optional(),
                }),
              )
              .optional(),
            assessmentQuestions: z
              .array(
                z.object({
                  question: z.string(),
                  options: z.array(z.string()),
                  correctAnswer: z.string(),
                  explanation: z.string().optional(),
                }),
              )
              .optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      // Check if user owns this campaign
      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.campaignId },
        select: { createdById: true },
      });

      if (!campaign || campaign.createdById !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to modify this campaign",
        });
      }

      // Create milestones with sub-milestones
      const createdMilestones = await Promise.all(
        input.milestones.map(async (milestone, index) => {
          const createdMilestone = await ctx.db.milestone.create({
            data: {
              campaignId: input.campaignId,
              bloomLevel: milestone.bloomLevel,
              title: milestone.title,
              objective: milestone.objective,
              externalResources: milestone.resources,
              order: index + 1,
              subMilestones: {
                create:
                  milestone.subMilestones?.map((subMilestone, subIndex) => ({
                    title: subMilestone.title,
                    objective: subMilestone.objective,
                    externalResources: subMilestone.resources,
                    estimatedTime: subMilestone.estimatedTime,
                    order: subIndex + 1,
                    quizzes: {
                      create:
                        subMilestone.assessmentQuestions?.map((q) => ({
                          title: `Quiz: ${subMilestone.title}`,
                          questions: {
                            questions: [
                              {
                                question: q.question,
                                options: q.options,
                                correctAnswer: q.correctAnswer,
                                explanation: q.explanation,
                              },
                            ],
                          },
                        })) || [],
                    },
                  })) || [],
              },
              quizzes: {
                create:
                  milestone.assessmentQuestions?.map((q) => ({
                    title: `Quiz: ${milestone.title}`,
                    questions: {
                      questions: [
                        {
                          question: q.question,
                          options: q.options,
                          correctAnswer: q.correctAnswer,
                          explanation: q.explanation,
                        },
                      ],
                    },
                  })) || [],
              },
            },
            include: {
              subMilestones: {
                include: {
                  quizzes: true,
                },
              },
              quizzes: true,
            },
          });

          return createdMilestone;
        }),
      );

      return createdMilestones;
    }),

  // Get user's draft campaigns
  getDrafts: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    return ctx.db.campaign.findMany({
      where: {
        createdById: ctx.user.id,
        isDraft: true,
      },
      include: {
        team: {
          select: { id: true, name: true },
        },
        _count: {
          select: { milestones: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }),

  // Create a new campaign (admin only) - legacy method
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        topic: z.string().min(1),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      return ctx.db.campaign.create({
        data: {
          ...input,
          createdById: ctx.user.id,
        },
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      });
    }),

  // Update campaign (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        topic: z.string().min(1).optional(),
        targetAudience: z.string().optional(),
        startingBloomLevel: z.number().min(1).max(6).optional(),
        targetBloomLevel: z.number().min(1).max(6).optional(),
        focusAreas: z.array(z.string()).optional(),
        resourceTypes: z.array(z.string()).optional(),
        excludedSources: z.array(z.string()).optional(),
        tone: z.string().optional(),
        estimatedDuration: z.number().optional(),
        challengeType: z.string().optional(),
        teamChallengeIdeas: z.string().optional(),
        isActive: z.boolean().optional(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const { id, ...updateData } = input;

      return ctx.db.campaign.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      });
    }),

  // Save campaign as draft
  saveDraft: protectedProcedure
    .input(
      z.object({
        campaignData: z.object({
          title: z.string(),
          description: z.string(),
          topic: z.string(),
          targetAudience: z.string().optional(),
          startingBloomLevel: z.number(),
          targetBloomLevel: z.number(),
          focusAreas: z.array(z.string()),
          estimatedDuration: z.number().optional(),
          tone: z.string().optional(),
        }),
        aiParams: z.object({
          learningStyle: z.string().optional(),
          difficultyPreference: z.string().optional(),
          contentFormat: z.string().optional(),
          timeCommitment: z.string().optional(),
          prerequisites: z.string().optional(),
          resourceTypes: z.string().optional(),
          finalOutcome: z.string().optional(),
          questionFormat: z.string().optional(),
        }),
        generatedContent: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      // Create the campaign draft
      const campaign = await ctx.db.campaign.create({
        data: {
          title: input.campaignData.title,
          description: input.campaignData.description,
          topic: input.campaignData.topic,
          targetAudience:
            input.campaignData.targetAudience || "General learners",
          startingBloomLevel: input.campaignData.startingBloomLevel,
          targetBloomLevel: input.campaignData.targetBloomLevel,
          focusAreas: input.campaignData.focusAreas,
          estimatedDuration: input.campaignData.estimatedDuration || 7,
          tone: input.campaignData.tone || "professional",
          createdBy: ctx.user.id,
          isPublic: false,
          scope: "draft",
          status: "draft",
          // Store AI params and generated content as JSON
          metadata: {
            aiParams: input.aiParams,
            generatedContent: input.generatedContent,
            savedAt: new Date().toISOString(),
          },
        },
      });

      return campaign;
    }),

  // Learning Session endpoints
  startLearningSession: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        milestoneId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { campaignId, milestoneId } = input;

      // Check if user is already enrolled, auto-enroll if not
      const existingUserCampaign = await ctx.db.userCampaign.findUnique({
        where: {
          userId_campaignId: {
            userId,
            campaignId,
          },
        },
      });

      let userCampaign;
      let isNewEnrollment = false;

      if (existingUserCampaign) {
        // User already enrolled, just update last active time
        userCampaign = await ctx.db.userCampaign.update({
          where: {
            userId_campaignId: {
              userId,
              campaignId,
            },
          },
          data: {
            lastActiveAt: new Date(),
          },
        });
      } else {
        // New enrollment
        isNewEnrollment = true;
        userCampaign = await ctx.db.userCampaign.create({
          data: {
            userId,
            campaignId,
            currentMilestone: 1,
            completedMilestones: [],
            joinedAt: new Date(),
            lastActiveAt: new Date(),
          },
        });
      }

      // Check if milestone exists and belongs to campaign
      const milestone = await ctx.db.milestone.findFirst({
        where: {
          id: milestoneId,
          campaignId,
        },
        include: { resources: true },
      });

      if (!milestone) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Milestone not found",
        });
      }

      // Check if there's already an active learning session
      const existingSession = await ctx.db.learningSession.findFirst({
        where: {
          userId,
          campaignId,
          milestoneId,
          isActive: true,
        },
      });

      if (existingSession) {
        return existingSession;
      }

      // Create new learning session
      const learningSession = await ctx.db.learningSession.create({
        data: {
          userId,
          campaignId,
          milestoneId,
          startedAt: new Date(),
          isActive: true,
        },
        include: {
          milestone: { include: { resources: true } },
          campaign: true,
        },
      });

      return { ...learningSession, isNewEnrollment };
    }),

  updateLearningSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        progress: z.number().min(0).max(100).optional(),
        timeSpent: z.number().min(0).optional(),
        completedResources: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { sessionId, progress, timeSpent, completedResources } = input;

      // Verify session belongs to user
      const session = await ctx.db.learningSession.findFirst({
        where: {
          id: sessionId,
          userId,
          isActive: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Learning session not found",
        });
      }

      // Update session
      const updatedSession = await ctx.db.learningSession.update({
        where: { id: sessionId },
        data: {
          ...(progress !== undefined && { progress }),
          ...(timeSpent !== undefined && { timeSpent }),
          ...(completedResources !== undefined && { completedResources }),
        },
        include: {
          milestone: { include: { resources: true } },
          campaign: true,
        },
      });

      return updatedSession;
    }),

  completeLearningSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { sessionId } = input;

      // Verify session belongs to user
      const session = await ctx.db.learningSession.findFirst({
        where: {
          id: sessionId,
          userId,
          isActive: true,
        },
        include: {
          milestone: true,
          campaign: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Learning session not found",
        });
      }

      // Calculate total time spent
      const timeSpent = Math.floor(
        (Date.now() - session.startedAt.getTime()) / (1000 * 60)
      );

      // Complete the session
      const completedSession = await ctx.db.learningSession.update({
        where: { id: sessionId },
        data: {
          isActive: false,
          completedAt: new Date(),
          progress: 100,
          timeSpent,
        },
        include: {
          milestone: { include: { resources: true } },
          campaign: true,
        },
      });

      // Update user's campaign progress
      const userCampaign = await ctx.db.userCampaign.findUnique({
        where: {
          userId_campaignId: {
            userId,
            campaignId: session.campaignId,
          },
        },
      });

      if (userCampaign) {
        // Add milestone to completed milestones
        const completedMilestones = [...userCampaign.completedMilestones];
        if (!completedMilestones.includes(session.milestone.order)) {
          completedMilestones.push(session.milestone.order);
        }

        // Update current milestone to next one
        const nextMilestone = await ctx.db.milestone.findFirst({
          where: {
            campaignId: session.campaignId,
            order: { gt: session.milestone.order },
          },
          orderBy: { order: "asc" },
        });

        await ctx.db.userCampaign.update({
          where: {
            userId_campaignId: {
              userId,
              campaignId: session.campaignId,
            },
          },
          data: {
            completedMilestones,
            currentMilestone: nextMilestone?.order ?? userCampaign.currentMilestone,
            lastActiveAt: new Date(),
          },
        });

        // Award points for milestone completion
        const pointsEarned = 50; // Base points for milestone completion
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            totalPoints: { increment: pointsEarned },
          },
        });

        // Log points earned
        await ctx.db.pointsLog.create({
          data: {
            userId,
            points: pointsEarned,
            reason: `Completed milestone: ${session.milestone.title}`,
            metadata: {
              milestoneId: session.milestone.id,
              campaignId: session.campaignId,
            },
          },
        });
      }

      return completedSession;
    }),

  getLearningSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { sessionId } = input;

      const session = await ctx.db.learningSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
        include: {
          milestone: {
            include: {
              lessons: {
                include: {
                  resources: true,
                },
              },
              quizzes: true,
              resources: true,
            },
          },
          campaign: true,
          resourceProgresses: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Learning session not found",
        });
      }

      return session;
    }),
});
