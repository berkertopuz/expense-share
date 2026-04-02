"use client";

import { useTranslations, useFormatter } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSplitType, toggleSplitter, setSplitterAmount } from "@/store/slices/expenseSlice";
import {
  selectSplits,
  selectSplitType,
  selectAmount,
  selectTotalSplit,
} from "@/store/selectors/expense.selectors";
import { formatTRY } from "@/utils/currency";

interface Props {
  members: { id: string; name: string }[];
}

export function Step3Splits({ members }: Props) {
  const t = useTranslations();
  const format = useFormatter();
  const dispatch = useAppDispatch();

  const splits = useAppSelector(selectSplits);
  const splitType = useAppSelector(selectSplitType);
  const totalAmount = useAppSelector(selectAmount);
  const totalSplit = useAppSelector(selectTotalSplit);

  const isBalanced = Math.abs(totalSplit - totalAmount) < 0.01;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={splitType === "equal"}
            onChange={() => dispatch(setSplitType("equal"))}
            className="text-green-600 focus:ring-green-500"
          />
          <span className="text-gray-700">{t("expenses.splitEqual")}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={splitType === "custom"}
            onChange={() => dispatch(setSplitType("custom"))}
            className="text-green-600 focus:ring-green-500"
          />
          <span className="text-gray-700">{t("expenses.splitCustom")}</span>
        </label>
      </div>

      <p className="text-sm text-gray-600 mb-4">{t("expenses.splitBetween")}</p>

      {members.map((member) => {
        const split = splits.find((s) => s.userId === member.id);
        const isSelected = !!split;

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
                    dispatch(toggleSplitter({ userId: member.id, userName: member.name }))
                  }
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="font-medium text-gray-800">{member.name}</span>
              </label>

              {isSelected &&
                (splitType === "equal" ? (
                  <span className="text-gray-600 font-medium">{formatTRY(split?.amount || 0)}</span>
                ) : (
                  <input
                    type="number"
                    min="0"
                    value={split?.amount || ""}
                    onChange={(e) =>
                      dispatch(
                        setSplitterAmount({
                          userId: member.id,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      )
                    }
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                ))}
            </div>
          </div>
        );
      })}

      <div className={`mt-6 p-4 rounded-lg ${isBalanced ? "bg-green-50" : "bg-red-50"}`}>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">{t("expenses.totalSplit")}</span>
          <span className={`font-bold ${isBalanced ? "text-green-700" : "text-red-700"}`}>
            {formatTRY(totalSplit)} / {formatTRY(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
