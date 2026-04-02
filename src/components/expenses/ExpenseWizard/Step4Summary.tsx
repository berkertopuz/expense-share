"use client";

import { useTranslations, useFormatter } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import {
  selectDescription,
  selectAmount,
  selectPayments,
  selectSplits,
} from "@/store/selectors/expense.selectors";
import { formatTRY } from "@/utils/currency";

export function Step4Summary() {
  const t = useTranslations();
  const format = useFormatter();

  const description = useAppSelector(selectDescription);
  const amount = useAppSelector(selectAmount);
  const payments = useAppSelector(selectPayments);
  const splits = useAppSelector(selectSplits);

  return (
    <div className="space-y-6">
      <div className="text-center pb-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">{description}</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">{formatTRY(amount)}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t("expenses.whoPaid")}</h4>
        <ul className="space-y-2">
          {payments.map((p) => (
            <li
              key={p.userId}
              className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg"
            >
              <span className="text-gray-800">{p.userName}</span>
              <span className="font-semibold text-green-700">{formatTRY(p.amount)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t("expenses.splitBetween")}</h4>
        <ul className="space-y-2">
          {splits.map((s) => (
            <li
              key={s.userId}
              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-800">{s.userName}</span>
              <span className="font-semibold text-gray-700">{formatTRY(s.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
