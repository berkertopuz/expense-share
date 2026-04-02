import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";

export const selectIsWizardOpen = (state: RootState) => state.expense.isOpen;
export const selectCurrentStep = (state: RootState) => state.expense.currentStep;
export const selectGroupId = (state: RootState) => state.expense.groupId;

export const selectDescription = (state: RootState) => state.expense.description;
export const selectAmount = (state: RootState) => state.expense.amount;
export const selectPayments = (state: RootState) => state.expense.payments;
export const selectSplits = (state: RootState) => state.expense.splits;
export const selectSplitType = (state: RootState) => state.expense.splitType;

export const selectTotalPaid = (state: RootState) =>
  state.expense.payments.reduce((sum, p) => sum + p.amount, 0);

export const selectTotalSplit = (state: RootState) =>
  state.expense.splits.reduce((sum, s) => sum + s.amount, 0);

export const selectIsStep1Valid = (state: RootState) =>
  state.expense.description.trim() !== "" && state.expense.amount > 0;

export const selectIsStep2Valid = (state: RootState) => {
  const totalPaid = state.expense.payments.reduce((sum, p) => sum + p.amount, 0);
  return state.expense.payments.length > 0 && Math.abs(totalPaid - state.expense.amount) < 0.01;
};

export const selectIsStep3Valid = (state: RootState) => {
  const totalSplit = state.expense.splits.reduce((sum, s) => sum + s.amount, 0);
  return state.expense.splits.length > 0 && Math.abs(totalSplit - state.expense.amount) < 0.01;
};

export const selectExpenseData = createSelector(
  [selectGroupId, selectDescription, selectAmount, selectPayments, selectSplits],
  (groupId, description, amount, payments, splits) => ({
    groupId,
    description,
    amount,
    payments: payments.map((p) => ({ userId: p.userId, amount: p.amount })),
    splits: splits.map((s) => ({ userId: s.userId, amount: s.amount })),
  })
);
