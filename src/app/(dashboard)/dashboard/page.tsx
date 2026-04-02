import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDebts, getUserDebts } from "@/utils/balance";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import styles from "./dashboard.module.scss";
import { formatTRY } from "@/utils/currency";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.dashboard");
  return { title: t("title") };
}

async function getUserStats(userId: string) {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  });

  const groupIds = memberships.map((m) => m.groupId);

  const expenses = await prisma.expense.findMany({
    where: { groupId: { in: groupIds } },
    include: {
      payments: true,
      splits: true,
    },
  });

  const debts = calculateDebts(expenses);
  const { theyOweMe, iOwe } = getUserDebts(debts, userId);

  const totalOwed = theyOweMe.reduce((sum, d) => sum + d.amount, 0);
  const totalOwing = iOwe.reduce((sum, d) => sum + d.amount, 0);

  return {
    totalOwed: Math.round(totalOwed * 100) / 100,
    totalOwing: Math.round(totalOwing * 100) / 100,
    netBalance: Math.round((totalOwed - totalOwing) * 100) / 100,
  };
}

export default async function DashboardPage() {
  const t = await getTranslations();
  const session = await auth();

  let stats = { totalOwed: 0, totalOwing: 0, netBalance: 0 };

  if (session?.user?.id) {
    stats = await getUserStats(session.user.id);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("navigation.dashboard")}</h1>

      <div className={styles.grid}>
        {/* Credit */}
        <article className={styles.card}>
          <div className={styles.card__header}>
            <div className={`${styles.card__icon} ${styles.card__icon_green}`}>
              <TrendingUp size={20} />
            </div>
            <p className={styles.card__label}>{t("balance.totalOwed")}</p>
          </div>
          <p className={`${styles.card__value} ${styles.card__value_green}`}>
            {formatTRY(stats.totalOwed)}
          </p>
          <p className={styles.card__hint}>{t("balance.owesYou")}</p>
        </article>

        {/* Debit */}
        <article className={styles.card}>
          <div className={styles.card__header}>
            <div className={`${styles.card__icon} ${styles.card__icon_red}`}>
              <TrendingDown size={20} />
            </div>
            <p className={styles.card__label}>{t("balance.totalOwing")}</p>
          </div>
          <p className={`${styles.card__value} ${styles.card__value_red}`}>
            {formatTRY(stats.totalOwing)}
          </p>
          <p className={styles.card__hint}>{t("balance.youOwe")}</p>
        </article>

        {/* Net */}
        <article className={styles.card}>
          <div className={styles.card__header}>
            <div className={`${styles.card__icon} ${styles.card__icon_blue}`}>
              <Wallet size={20} />
            </div>
            <p className={styles.card__label}>{t("balance.netBalance")}</p>
          </div>
          <p
            className={`${styles.card__value} ${stats.netBalance >= 0 ? styles.card__value_green : styles.card__value_red}`}
          >
            {stats.netBalance >= 0 ? "+" : ""}
            {formatTRY(stats.netBalance)}
          </p>
          <p className={styles.card__hint}>
            {stats.netBalance >= 0 ? t("balance.positive") : t("balance.negative")}
          </p>
        </article>
      </div>
    </div>
  );
}
