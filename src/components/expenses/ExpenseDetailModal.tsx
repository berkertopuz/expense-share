"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/Button";
import { formatTRY } from "@/utils/currency";

interface Payment {
  user: { id: string; name: string };
  amount: number;
}

interface Split {
  user: { id: string; name: string };
  amount: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
  payments: Payment[];
  splits: Split[];
}

interface Props {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseDetailModal({ expense, isOpen, onClose }: Props) {
  const t = useTranslations();
  const format = useFormatter();

  if (!isOpen || !expense) return null;

  const paymentMap = Object.fromEntries(expense.payments.map((p) => [p.user.id, p.amount]));
  const splitMap = Object.fromEntries(expense.splits.map((s) => [s.user.id, s.amount]));

  const allUserIds = new Set([
    ...expense.payments.map((p) => p.user.id),
    ...expense.splits.map((s) => s.user.id),
  ]);

  const userDetails = Array.from(allUserIds).map((userId) => {
    const payment = expense.payments.find((p) => p.user.id === userId);
    const split = expense.splits.find((s) => s.user.id === userId);
    const paid = paymentMap[userId] || 0;
    const owes = splitMap[userId] || 0;
    const balance = paid - owes;
    return {
      id: userId,
      name: payment?.user.name || split?.user.name || "",
      paid,
      owes,
      balance,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div
        className="relative bg-white rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="text-xl font-semibold text-gray-900 mb-2">
          {expense.description}
        </h2>
        <p className="text-2xl font-bold text-gray-900 mb-6">{formatTRY(expense.amount)}</p>

        <div className="mb-8">
          <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-gray-600 mb-3 px-3">
            <span>{t("expenses.person")}</span>
            <span className="text-right">{t("expenses.paid")}</span>
            <span className="text-right">{t("expenses.share")}</span>
          </div>
          <ul className="space-y-2">
            {userDetails.map((user) => (
              <li
                key={user.id}
                className={`flex items-center py-3 px-3 rounded-lg ${
                  user.balance > 0.01
                    ? "bg-green-50 border border-green-200"
                    : user.balance < -0.01
                      ? "bg-red-50 border border-red-200"
                      : "bg-gray-50 border border-gray-200"
                }`}
              >
                <span className="flex-1 text-gray-800 font-medium">{user.name}</span>
                <span
                  className={`w-24 text-right font-semibold ${
                    user.balance > 0.01
                      ? "text-green-700"
                      : user.balance < -0.01
                        ? "text-red-700"
                        : "text-gray-700"
                  }`}
                >
                  {formatTRY(user.paid)}
                </span>
                <span className="w-24 text-right text-gray-600">{formatTRY(user.owes)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {t("common.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
