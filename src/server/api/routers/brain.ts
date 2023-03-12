import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const brainRouter = createTRPCRouter({
  // queries
  getBrains: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.brain.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  getBrain: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.brain.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        include: {
          files: true,
        },
      });
    }),
  getAssignedFiles: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.fileMetadata.findMany({
        where: {
          userId: ctx.session.user.id,
          brains: {
            some: {
              id,
            },
          },
        },
      });
    }),
  getUnassignedFiles: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.fileMetadata.findMany({
        where: {
          userId: ctx.session.user.id,
          NOT: {
            brains: {
              some: {
                id,
              },
            },
          },
        },
      });
    }),

  // mutations
  createBrain: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        size: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, size } = input;

      const createdBrain = await ctx.prisma.brain.create({
        data: {
          name,
          size,
          userId: ctx.session.user.id,
        },
      });

      return createdBrain;
    }),
  deleteBrain: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      console.log(id);

      await ctx.prisma.brain.deleteMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });
    }),
  assignFiles: protectedProcedure
    .input(
      z.object({
        brainId: z.string(),
        ids: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { ids, brainId } = input;

      // Find all the brains that match the given brainId and userId conditions
      const brains = await ctx.prisma.brain.findMany({
        where: {
          id: brainId,
          userId: ctx.session.user.id,
        },
        include: {
          files: true,
        },
      });

      // Iterate over all the brains and update the files relation
      const updatedBrains = await Promise.all(
        brains.map((brain) => {
          return ctx.prisma.brain.update({
            where: {
              id: brain.id,
            },
            data: {
              files: {
                connect: ids.map((id) => ({ id })),
              },
            },
            include: {
              files: true,
            },
          });
        })
      );

      // Return the updated brains
      return updatedBrains;
    }),
  unassignFiles: protectedProcedure
    .input(
      z.object({
        brainId: z.string(),
        ids: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { ids, brainId } = input;

      // Find all the brains that match the given brainId and userId conditions
      const brains = await ctx.prisma.brain.findMany({
        where: {
          id: brainId,
          userId: ctx.session.user.id,
        },
        include: {
          files: true,
        },
      });

      // Iterate over all the brains and update the files relation
      const updatedBrains = await Promise.all(
        brains.map((brain) => {
          return ctx.prisma.brain.update({
            where: {
              id: brain.id,
            },
            data: {
              files: {
                disconnect: ids.map((id) => ({ id })),
              },
            },
            include: {
              files: true,
            },
          });
        })
      );

      // Return the updated brains
      return updatedBrains;
    }),
});
