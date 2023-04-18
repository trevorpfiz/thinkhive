import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const brainRouter = createTRPCRouter({
  // queries
  getBrains: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.brain.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        files: true,
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
  getLearnedFiles: protectedProcedure
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
  getUnlearnedFiles: protectedProcedure
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

  // mutations ----------------------------------------------
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
  renameBrain: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;

      const updatedBrain = await ctx.prisma.brain.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });

      return updatedBrain;
    }),
  deleteBrain: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      await ctx.prisma.brain.deleteMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });
    }),
  learnFiles: protectedProcedure
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

      // FIXME - Calculate the total size of files being learned
      // const totalSize = (await ctx.prisma.fileMetadata.aggregate({
      //   where: {
      //     id: {
      //       in: ids,
      //     },
      //   },
      //   _sum: {
      //     wordCount: true,
      //   },
      // })) as { _sum: { wordCount: number } };

      // Iterate over all the brains and update the files relation
      const updatedBrains = await Promise.all(
        brains.map((brain) => {
          return ctx.prisma.brain.update({
            where: {
              id: brain.id,
            },
            data: {
              files: {
                connect: ids.map((id) => ({ metadataId: id })),
              },
              // size: brain.size + totalSize._sum.wordCount,
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
  unlearnFiles: protectedProcedure
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

      // FIXME - Calculate the total size of files being unlearned
      // const totalSize = (await ctx.prisma.fileMetadata.aggregate({
      //   where: {
      //     id: {
      //       in: ids,
      //     },
      //   },
      //   _sum: {
      //     wordCount: true,
      //   },
      // })) as { _sum: { wordCount: number } };

      // Iterate over all the brains and update the files relation
      const updatedBrains = await Promise.all(
        brains.map((brain) => {
          return ctx.prisma.brain.update({
            where: {
              id: brain.id,
            },
            data: {
              files: {
                disconnect: ids.map((id) => ({ metadataId: id })),
              },
              // size: Math.max(0, brain.size - totalSize._sum.wordCount),
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
  updateSize: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const brain = await ctx.prisma.brain.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        include: {
          files: true,
        },
      });

      if (!brain) {
        throw new Error('Brain not found');
      }

      const totalSize = (await ctx.prisma.fileMetadata.aggregate({
        where: {
          id: {
            in: brain.files.map((file) => file.id),
          },
        },
        _sum: {
          wordCount: true,
        },
      })) as { _sum: { wordCount: number } };

      const updatedBrain = await ctx.prisma.brain.update({
        where: {
          id,
        },
        data: {
          size: totalSize._sum.wordCount,
        },
      });

      return updatedBrain;
    }),
});
