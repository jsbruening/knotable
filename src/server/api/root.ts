import { postRouter } from "~/server/api/routers/post";
import { authRouter } from "~/server/api/routers/auth";
import { campaignRouter } from "~/server/api/routers/campaign";
import { gamificationRouter } from "~/server/api/routers/gamification";
import { teamRouter } from "~/server/api/routers/team";
import { adminRouter } from "~/server/api/routers/admin";
import { adminSettingsRouter } from "~/server/api/routers/admin-settings";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  campaign: campaignRouter,
  gamification: gamificationRouter,
  team: teamRouter,
  admin: adminRouter,
  adminSettings: adminSettingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
