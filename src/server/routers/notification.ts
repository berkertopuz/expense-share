import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import webPush from "web-push";

webPush.setVapidDetails(
  "mailto:berker.topuz@adesso.com.tr",
  process.env.NEXT_PUBLIC_VAPID_KEY || "",
  process.env.NEXT_PRIVATE_VAPID_KEY || ""
);

export const notificationRouter = router({
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      await ctx.prisma.pushSubscription.upsert({
        where: { endpoint: input.endpoint },
        update: {
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
        },
        create: {
          userId,
          endpoint: input.endpoint,
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
        },
      });

      return { success: true };
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.pushSubscription.deleteMany({
        where: { endpoint: input.endpoint },
      });

      return { success: true };
    }),
});

export async function sendPushToUser(
  prisma: any,
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      );
    } catch (error: any) {
      if (error.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}
