import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminSettingsRouter = createTRPCRouter({
  // Get all admin settings
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (!ctx.session?.user?.isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access admin settings",
      });
    }

    const settings = await ctx.db.adminSettings.findMany({
      orderBy: { key: "asc" },
    });

    // Convert to key-value pairs for easier frontend usage
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
        updatedBy: setting.updatedBy,
      };
      return acc;
    }, {} as Record<string, any>);

    return settingsMap;
  }),

  // Get a specific setting
  get: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (!ctx.session?.user?.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access admin settings",
        });
      }

      const setting = await ctx.db.adminSettings.findUnique({
        where: { key: input.key },
      });

      return setting;
    }),

  // Set a specific setting
  set: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (!ctx.session?.user?.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can modify admin settings",
        });
      }

      const userId = ctx.session.user.id;

      // Upsert the setting
      const setting = await ctx.db.adminSettings.upsert({
        where: { key: input.key },
        update: {
          value: input.value,
          description: input.description,
          updatedBy: userId,
        },
        create: {
          key: input.key,
          value: input.value,
          description: input.description,
          updatedBy: userId,
        },
      });

      return setting;
    }),

  // Delete a setting
  delete: protectedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (!ctx.session?.user?.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete admin settings",
        });
      }

      await ctx.db.adminSettings.delete({
        where: { key: input.key },
      });

      return { success: true };
    }),

  // Get Gemini disable status (public for LLM system to check)
  getGeminiDisabled: publicProcedure.query(async ({ ctx }) => {
    const setting = await ctx.db.adminSettings.findUnique({
      where: { key: "gemini_disabled" },
    });

    return setting?.value === "true";
  }),
});
