import { createTRPCRouter } from "~/server/api/trpc";
import { aimsRouter } from "./routers/aims";
import { intentsRouter } from "./routers/intents";
import { usersRouter } from "./routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  aims: aimsRouter,
  intents: intentsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
