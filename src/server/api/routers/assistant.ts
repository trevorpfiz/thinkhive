import { Visibility } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { getMaxAssistantsForTier, getSubscriptionProductId } from '~/server/helpers/permissions';

export const assistantRouter = createTRPCRouter({
  // queries
  getAssistants: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.assistant.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        brains: { include: { files: true } },
      },
    });
  }),
  getAssistant: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.assistant.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        include: {
          brains: { include: { files: true } },
        },
      });
    }),
  getAttachedBrains: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.brain.findMany({
        where: {
          userId: ctx.session.user.id,
          assistants: {
            some: {
              id,
            },
          },
        },
      });
    }),
  getDetachedBrains: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.brain.findMany({
        where: {
          userId: ctx.session.user.id,
          NOT: {
            assistants: {
              some: {
                id,
              },
            },
          },
        },
        include: {
          files: true,
        },
      });
    }),
  getWidgetAssistant: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const assistant = await ctx.prisma.assistant.findFirst({
        where: {
          id,
        },
        include: {
          brains: { include: { files: true } },
        },
      });

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      return assistant;
    }),

  // mutations ----------------------------------------
  createAssistant: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        size: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, size } = input;
      const userId = ctx.session.user.id;

      // Get the user's subscription tier
      const productId = await getSubscriptionProductId(userId);

      // Determine the maximum number of assistants the user is allowed to create based on their tier
      const maxAssistants = getMaxAssistantsForTier(productId);

      // Count the number of assistants the user has created
      const assistantCount = await ctx.prisma.assistant.count({
        where: {
          userId,
        },
      });

      // If the user has reached the maximum number of assistants, throw an error
      if (assistantCount >= maxAssistants) {
        throw new Error(
          `You have reached the maximum number of assistants allowed for your plan (${maxAssistants}).`
        );
      }

      const createdAssistant = await ctx.prisma.assistant.create({
        data: {
          name,
          size,
          userId: ctx.session.user.id,
        },
      });

      return createdAssistant;
    }),
  renameAssistant: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;

      const updatedAssistant = await ctx.prisma.assistant.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });

      return updatedAssistant;
    }),
  toggleStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const assistant = await ctx.prisma.assistant.findFirst({
        where: {
          id,
        },
      });

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      const updatedAssistant = await ctx.prisma.assistant.update({
        where: {
          id,
        },
        data: {
          status: assistant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        },
      });

      return updatedAssistant;
    }),
  changeSettings: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        settings: z.object({
          initialMessages: z.string(),
          domains: z.string(),
          visibility: z.nativeEnum(Visibility),
          systemMessage: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, settings } = input;

      const updatedAssistant = await ctx.prisma.assistant.update({
        where: {
          id,
        },
        data: {
          initialMessages: settings.initialMessages,
          domains: settings.domains,
          visibility: settings.visibility,
          systemMessage: settings.systemMessage,
        },
      });

      return updatedAssistant;
    }),
  deleteAssistant: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      await ctx.prisma.assistant.deleteMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });
    }),
  attachBrain: protectedProcedure
    .input(
      z.object({
        assistantId: z.string(),
        brainId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assistantId, brainId } = input;

      await ctx.prisma.brain.update({
        where: {
          id: brainId,
        },
        data: {
          assistants: {
            connect: {
              id: assistantId,
            },
          },
        },
      });
    }),
  detachBrain: protectedProcedure
    .input(
      z.object({
        assistantId: z.string(),
        brainId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assistantId, brainId } = input;

      await ctx.prisma.brain.update({
        where: {
          id: brainId,
        },
        data: {
          assistants: {
            disconnect: {
              id: assistantId,
            },
          },
        },
      });
    }),

  // testTokenizer: publicProcedure
  //   .input(
  //     z.object({
  //       texttt: z.string(),
  //     })
  //   )
  //   .query(({ ctx, input }) => {
  //     const { texttt } = input;

  //     const bertTokenizer = new BertTokenizer(undefined, true, 512);

  //     const tokenIds = bertTokenizer.tokenize(texttt);
  //     const tokens = bertTokenizer.convertIdsToTokens(tokenIds);

  //     function buildDict(inputBatch: number[][]): SparseValues[] {
  //       return inputBatch.map((tokenIds) => {
  //         const tokenCounts = tokenIds.reduce((acc, tokenId) => {
  //           acc[tokenId] = (acc[tokenId] || 0) + 1;
  //           return acc;
  //         }, {} as Record<number, number>);

  //         return {
  //           indices: Object.keys(tokenCounts).map(Number),
  //           values: Object.values(tokenCounts),
  //         };
  //       });
  //     }

  //     console.log(tokenIds, 'tokenIds');
  //     const sparseVec = buildDict([tokenIds])[0];

  //     const convertedExample = bertTokenizer.convertSingleExample(texttt);

  //     return {
  //       tokens: tokens,
  //       sparseVec: sparseVec,
  //       convertedExample: convertedExample,
  //     };
  //   }),
});
