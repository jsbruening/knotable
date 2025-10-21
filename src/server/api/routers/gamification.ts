import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const gamificationRouter = createTRPCRouter({
  // Get user's points and stats
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        totalPoints: true,
        totalKudos: true,
        loginStreak: true,
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: "desc" },
        },
        unlockables: {
          include: { unlockable: true },
          where: { isActive: true },
        },
        pointsLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return user;
  }),

  // Give kudos to another user
  giveKudos: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        type: z.enum(["beverage", "kudo_bomb", "custom"]),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.receiverId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot give kudos to yourself",
        });
      }

      const receiver = await ctx.db.user.findUnique({
        where: { id: input.receiverId },
      });

      if (!receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Receiver not found",
        });
      }

      const points = input.type === "kudo_bomb" ? 30 : 10;

      // Create kudo
      const kudo = await ctx.db.kudo.create({
        data: {
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          type: input.type,
          reason: input.reason,
          points,
        },
      });

      // Update points for both users
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: { totalPoints: { increment: 5 } }, // Small reward for giving kudos
      });

      await ctx.db.user.update({
        where: { id: input.receiverId },
        data: {
          totalPoints: { increment: points },
          totalKudos: { increment: 1 },
        },
      });

      // Log points
      await ctx.db.pointsLog.createMany({
        data: [
          {
            userId: ctx.user.id,
            points: 5,
            reason: "kudo_given",
            metadata: { kudoId: kudo.id, receiverId: input.receiverId },
          },
          {
            userId: input.receiverId,
            points,
            reason: "kudo_received",
            metadata: { kudoId: kudo.id, senderId: ctx.user.id },
          },
        ],
      });

      // Create notification for receiver
      await ctx.db.notification.create({
        data: {
          userId: input.receiverId,
          type: "kudo_received",
          title: "Kudos Received!",
          message: `${ctx.user.displayName || ctx.user.email} gave you kudos: ${input.reason}`,
          metadata: { kudoId: kudo.id, senderId: ctx.user.id },
        },
      });

      return kudo;
    }),

  // Get kudos leaderboard
  getKudosLeaderboard: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          totalKudos: true,
          totalPoints: true,
        },
        orderBy: { totalKudos: "desc" },
        take: input.limit,
      });

      return users;
    }),

  // Get available badges
  getAvailableBadges: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.badge.findMany({
      where: { isActive: true },
      orderBy: { pointsRequired: "asc" },
    });
  }),

  // Get user's badges
  getUserBadges: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userBadge.findMany({
      where: { userId: ctx.user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });
  }),

  // Get available unlockables
  getAvailableUnlockables: publicProcedure
    .input(
      z.object({
        type: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.unlockable.findMany({
        where: {
          isActive: true,
          ...(input.type && { type: input.type }),
        },
        orderBy: { pointsRequired: "asc" },
      });
    }),

  // Get user's unlockables
  getUserUnlockables: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userUnlockable.findMany({
      where: { userId: ctx.user.id, isActive: true },
      include: { unlockable: true },
      orderBy: { unlockedAt: "desc" },
    });
  }),

  // Unlock an item
  unlockItem: protectedProcedure
    .input(z.object({ unlockableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const unlockable = await ctx.db.unlockable.findUnique({
        where: { id: input.unlockableId },
      });

      if (!unlockable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unlockable not found",
        });
      }

      if (!unlockable.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unlockable is not available",
        });
      }

      if (ctx.user.totalPoints < unlockable.pointsRequired) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient points",
        });
      }

      // Check if already unlocked
      const existingUnlock = await ctx.db.userUnlockable.findUnique({
        where: {
          userId_unlockableId: {
            userId: ctx.user.id,
            unlockableId: input.unlockableId,
          },
        },
      });

      if (existingUnlock) {
        throw new TRPCError({ code: "CONFLICT", message: "Already unlocked" });
      }

      // Create unlock
      const userUnlockable = await ctx.db.userUnlockable.create({
        data: {
          userId: ctx.user.id,
          unlockableId: input.unlockableId,
        },
        include: { unlockable: true },
      });

      // Deduct points
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: { totalPoints: { decrement: unlockable.pointsRequired } },
      });

      // Log points
      await ctx.db.pointsLog.create({
        data: {
          userId: ctx.user.id,
          points: -unlockable.pointsRequired,
          reason: "unlockable_purchased",
          metadata: { unlockableId: input.unlockableId },
        },
      });

      return userUnlockable;
    }),

  // Get points history
  getPointsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db.pointsLog.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (logs.length > input.limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem?.id;
      }

      return {
        logs,
        nextCursor,
      };
    }),

  // Get notifications
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        unreadOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.notification.findMany({
        where: {
          userId: ctx.user.id,
          ...(input.unreadOnly && { isRead: false }),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  // Mark notification as read
  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notification.update({
        where: { id: input.notificationId },
        data: { isRead: true },
      });
    }),

  // Mark all notifications as read
  markAllNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db.notification.updateMany({
      where: { userId: ctx.user.id, isRead: false },
      data: { isRead: true },
    });
  }),
});
