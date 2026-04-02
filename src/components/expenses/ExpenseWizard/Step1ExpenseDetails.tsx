"use client";

import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDescription, setAmount } from "@/store/slices/expenseSlice";
import { selectDescription, selectAmount } from "@/store/selectors/expense.selectors";
import { Input } from "@/components/ui/Input";

export function Step1ExpenseDetails() {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const description = useAppSelector(selectDescription);
  const amount = useAppSelector(selectAmount);

  return (
    <div className="space-y-6">
      <Input
        label={t("expenses.description")}
        value={description}
        onChange={(e) => dispatch(setDescription(e.target.value))}
        placeholder={t("expenses.descriptionPlaceholder")}
        required
      />

      <Input
        label={t("expenses.amount")}
        type="number"
        min="0"
        value={amount || ""}
        onChange={(e) => dispatch(setAmount(parseFloat(e.target.value) || 0))}
        placeholder="0.00"
        required
      />
    </div>
  );
}
