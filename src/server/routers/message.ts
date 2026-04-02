import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const messageRouter = router({
  listByGroup: protectedProcedure.input(z.string()).query(async ({ ctx, input: groupId }) => {
    return ctx.prisma.message.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const message = await ctx.prisma.message.create({
        data: {
          content: input.content,
          groupId: input.groupId,
          userId,
        },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      return message;
    }),
});
