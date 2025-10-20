import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const teamRouter = createTRPCRouter({
  // Get all public teams
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const teams = await ctx.db.team.findMany({
        where: { isPublic: true },
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (teams.length > input.limit) {
        const nextItem = teams.pop();
        nextCursor = nextItem?.id;
      }

      return {
        teams,
        nextCursor,
      };
    }),

  // Get team by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: input.id },
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, displayName: true, avatarUrl: true, totalPoints: true },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
          challenges: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { members: true },
          },
        },
      });

      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      }

      return team;
    }),

  // Create a new team
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50),
      description: z.string().optional(),
      bannerUrl: z.string().url().optional(),
      isPublic: z.boolean().default(true),
      maxMembers: z.number().min(2).max(50).default(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.db.team.create({
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

      // Add creator as admin member
      await ctx.db.userTeam.create({
        data: {
          userId: ctx.user.id,
          teamId: team.id,
          role: "admin",
        },
      });

      return team;
    }),

  // Join a team
  join: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
        include: {
          _count: { select: { members: true } },
        },
      });

      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      }

      if (!team.isPublic) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Team is not public" });
      }

      if (team._count.members >= team.maxMembers) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Team is full" });
      }

      // Check if user is already in the team
      const existingMembership = await ctx.db.userTeam.findUnique({
        where: {
          userId_teamId: {
            userId: ctx.user.id,
            teamId: input.teamId,
          },
        },
      });

      if (existingMembership) {
        throw new TRPCError({ code: "CONFLICT", message: "Already a member of this team" });
      }

      return ctx.db.userTeam.create({
        data: {
          userId: ctx.user.id,
          teamId: input.teamId,
        },
        include: {
          team: {
            include: {
              createdBy: {
                select: { id: true, displayName: true, avatarUrl: true },
              },
            },
          },
        },
      });
    }),

  // Leave a team
  leave: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.userTeam.findUnique({
        where: {
          userId_teamId: {
            userId: ctx.user.id,
            teamId: input.teamId,
          },
        },
        include: { team: true },
      });

      if (!membership) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Not a member of this team" });
      }

      // Check if user is the creator
      if (membership.team.createdById === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Team creator cannot leave. Transfer ownership first." });
      }

      return ctx.db.userTeam.delete({
        where: { id: membership.id },
      });
    }),

  // Get user's teams
  getUserTeams: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userTeam.findMany({
      where: { userId: ctx.user.id },
      include: {
        team: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
  }),

  // Get team chat messages
  getChatMessages: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is a member of the team
      const membership = await ctx.db.userTeam.findUnique({
        where: {
          userId_teamId: {
            userId: ctx.user.id,
            teamId: input.teamId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this team" });
      }

      const messages = await ctx.db.teamChatMessage.findMany({
        where: { teamId: input.teamId },
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (messages.length > input.limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        nextCursor,
      };
    }),

  // Send chat message
  sendMessage: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      content: z.string().min(1).max(1000),
      messageType: z.enum(["text", "image", "file", "system"]).default("text"),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member of the team
      const membership = await ctx.db.userTeam.findUnique({
        where: {
          userId_teamId: {
            userId: ctx.user.id,
            teamId: input.teamId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this team" });
      }

      return ctx.db.teamChatMessage.create({
        data: {
          teamId: input.teamId,
          userId: ctx.user.id,
          content: input.content,
          messageType: input.messageType,
          metadata: input.metadata,
        },
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      });
    }),

  // Create team challenge
  createChallenge: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      title: z.string().min(1),
      description: z.string().min(1),
      pointsReward: z.number().min(1).default(100),
      campaignId: z.string().optional(),
      milestoneId: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is an admin of the team
      const membership = await ctx.db.userTeam.findUnique({
        where: {
          userId_teamId: {
            userId: ctx.user.id,
            teamId: input.teamId,
          },
        },
      });

      if (!membership || membership.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      return ctx.db.teamChallenge.create({
        data: input,
        include: {
          team: true,
          campaign: true,
          milestone: true,
        },
      });
    }),

  // Get team challenges
  getTeamChallenges: publicProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.teamChallenge.findMany({
        where: { teamId: input.teamId, isActive: true },
        include: {
          campaign: true,
          milestone: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});

