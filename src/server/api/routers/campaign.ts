import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const campaignRouter = createTRPCRouter({
  // Get all public campaigns
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().nullish(),
    }))
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
              quizzes: true,
            },
          },
          _count: {
            select: { users: true },
          },
        },
      });

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      return campaign;
    }),

  // Join a campaign
  join: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      if (!campaign.isPublic) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Campaign is not public" });
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
        throw new TRPCError({ code: "CONFLICT", message: "Already joined this campaign" });
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Not a member of this campaign" });
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

  // Create a new campaign (admin only)
  create: protectedProcedure
    .input(z.object({
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
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
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
    .input(z.object({
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
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
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
});

