"use client";

import { useTranslations, useFormatter } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { togglePayer, setPayerAmount } from "@/store/slices/expenseSlice";
import { selectPayments, selectAmount, selectTotalPaid } from "@/store/selectors/expense.selectors";
import { Input } from "@/components/ui/Input";
import { formatTRY } from "@/utils/currency";

interface Props {
  members: { id: string; name: string }[];
}

export function Step2Payers({ members }: Props) {
  const t = useTranslations();
  const format = useFormatter();
  const dispatch = useAppDispatch();

  const payments = useAppSelector(selectPayments);
  const totalAmount = useAppSelector(selectAmount);
  const totalPaid = useAppSelector(selectTotalPaid);

  const isBalanced = Math.abs(totalPaid - totalAmount) < 0.01;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">{t("expenses.whoPaid")}</p>

      {members.map((member) => {
        const payment = payments.find((p) => p.userId === member.id);
        const isSelected = !!payment;

        return (
          <div
            key={member.id}
            className={`p-4 rounded-lg border transition-colors ${
              isSelected ? "border-green-300 bg-green-50" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    dispatch(togglePayer({ userId: member.id, userName: member.name }))
                  }
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="font-medium text-gray-800">{member.name}</span>
              </label>

              {isSelected && (
                <div className="w-28">
                  <Input
                    type="number"
                    min="0"
                    value={payment?.amount || ""}
                    onChange={(e) =>
                      dispatch(
                        setPayerAmount({
                          userId: member.id,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      )
                    }
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className={`mt-6 p-4 rounded-lg ${isBalanced ? "bg-green-50" : "bg-red-50"}`}>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">{t("expenses.totalPaid")}</span>
          <span className={`font-bold ${isBalanced ? "text-green-700" : "text-red-700"}`}>
            {formatTRY(totalPaid)} / {formatTRY(totalAmount)}
          </span>
        </div>
        {!isBalanced && (
          <p className="text-sm text-red-600 mt-2">
            {totalPaid < totalAmount
              ? t("expenses.errors.insufficientPayment")
              : t("expenses.errors.excessPayment")}
          </p>
        )}
      </div>
    </div>
  );
}
