import { clerkClient } from "@clerk/nextjs";

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { IntentStatus, type Intent } from "@prisma/client";

const intentSchema = z
  .object({
    // Zod Validator - www.github.com/colinhacks/zod
    // Type definition inferred from the validator
    startDate: z.date().refine(
      (date) => {
        const serverTime = new Date();
        const fiveMinutesAgo = new Date(serverTime);
        fiveMinutesAgo.setMinutes(serverTime.getMinutes() - 5);

        return date >= fiveMinutesAgo;
      },
      {
        message: "Start date cannot be more than 5 minutes in the past.",
      },
    ),

    endDate: z.date(),
    status: z.enum(["ACTIVE", "PAUSED", "DELETED", "COMPLETED"]), // Replace with your actual enum values
    reminders: z.string().min(2, {
      message: "Reminders must be at least 2 characters.",
    }),
    aimId: z.string(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date cannot be earlier than start date.",
    path: ["endDate"],
  });

const addUserDataToIntents = async (intents: Intent[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: intents.map((intent) => intent.creatorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return intents.map((intent) => {
    const creator = users.find((user) => user.id === intent.creatorId);
    if (!creator?.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "creator for intent not found",
      });

    return {
      intent,
      creator: {
        ...creator,
        username: creator.username,
      },
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const intentsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const intent = await ctx.prisma.intent.findUnique({
        where: { id: input.id },
      });

      if (!intent) throw new TRPCError({ code: "NOT_FOUND" });

      const [intentWithUserData] = await addUserDataToIntents([intent]);
      return intentWithUserData;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const intents = await ctx.prisma.intent.findMany({
      take: 100,
      orderBy: [{ createdOn: "desc" }], //descending, newest first
    });

    return addUserDataToIntents(intents);
  }),

  getIntentsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.prisma.intent
        .findMany({
          where: {
            creatorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdOn: "desc" }],
        })
        .then(addUserDataToIntents),
    ),

  // *******PRIVATE PROCEDURES
  // *******CREATE
  create: privateProcedure
    .input(intentSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.userId;

      const { success } = await ratelimit.limit(currentUser);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const intent = await ctx.prisma.intent.create({
        data: {
          creatorId: currentUser,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          status: input.status,
          reminders: input.reminders,
          aimId: input.aimId,
        },
      });

      return intent;
    }),

  // *******SOFT DELETE
  softDelete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.userId;
      const intentId = input.id;

      // Check if the user has permission to update this intent
      const intent = await ctx.prisma.intent.findUnique({
        where: { id: intentId },
      });

      if (!intent) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (intent.creatorId !== currentUser) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Perform the update
      const softDeletedIntent = await ctx.prisma.intent.update({
        where: { id: intentId },
        data: {
          status: IntentStatus.DELETED,
        },
      });

      return softDeletedIntent;
    }),
});
