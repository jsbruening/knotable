import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  // Get current user
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().min(1).optional(),
      githubUsername: z.string().optional(),
      githubRepoUrl: z.string().url().optional(),
      currentBloomLevel: z.number().min(1).max(6).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.user.id },
        data: input,
      });
    }),

  // Complete onboarding
  completeOnboarding: protectedProcedure
    .input(z.object({
      displayName: z.string().min(1).optional(),
      githubUsername: z.string().optional(),
      githubRepoUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          ...input,
          onboardingCompleted: true,
        },
      });
    }),

  // Update login streak
  updateLoginStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: { lastLoginAt: true, loginStreak: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const now = new Date();
    const lastLogin = user.lastLoginAt;
    
    let newStreak = user.loginStreak;
    
    if (lastLogin) {
      const daysSinceLastLogin = Math.floor(
        (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastLogin === 1) {
        newStreak += 1;
      } else if (daysSinceLastLogin > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    return ctx.db.user.update({
      where: { id: ctx.user.id },
      data: {
        loginStreak: newStreak,
        lastLoginAt: now,
      },
    });
  }),
});

