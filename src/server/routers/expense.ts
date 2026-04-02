import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { sendPushToUser } from "./notification";

export const expenseRouter = router({
  listByGroup: protectedProcedure.input(z.string()).query(async ({ ctx, input: groupId }) => {
    return ctx.prisma.expense.findMany({
      where: { groupId },
      include: {
        payments: {
          include: { user: { select: { id: true, name: true } } },
        },
        splits: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        description: z.string().min(1),
        amount: z.number().positive(),
        payments: z.array(
          z.object({
            userId: z.string(),
            amount: z.number(),
          })
        ),
        splits: z.array(
          z.object({
            userId: z.string(),
            amount: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;
      const userName = ctx.session.user?.name || "Bilinmeyen Kullanıcı";

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const expense = await ctx.prisma.expense.create({
        data: {
          description: input.description,
          amount: input.amount,
          groupId: input.groupId,
          payments: {
            create: input.payments,
          },
          splits: {
            create: input.splits,
          },
        },
        include: {
          payments: {
            include: { user: { select: { id: true, name: true } } },
          },
          splits: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      });

      const group = await ctx.prisma.group.findUnique({
        where: { id: input.groupId },
        include: {
          members: { select: { userId: true } },
        },
      });

      if (group) {
        const otherMembers = group.members.filter((m) => m.userId !== userId);

        for (const member of otherMembers) {
          await sendPushToUser(ctx.prisma, member.userId, {
            title: "Yeni Harcama",
            body: `${userName} ${input.amount.toFixed(2)}₺ ${input.description} ekledi`,
            url: `/groups/${input.groupId}`,
          });
        }
      }

      return expense;
    }),

  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input: expenseId }) => {
    return ctx.prisma.expense.delete({
      where: { id: expenseId },
    });
  }),
});
