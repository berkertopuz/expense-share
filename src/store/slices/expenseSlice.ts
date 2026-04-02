import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ExpenseWizardState } from "../types/expense.types";

const initialState: ExpenseWizardState = {
  isOpen: false,
  groupId: null,
  currentStep: 1,
  description: "",
  amount: 0,
  payments: [],
  splits: [],
  splitType: "equal",
  lastDeleted: null,
};

export const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    openWizard: (state, action: PayloadAction<{ groupId: string }>) => {
      state.isOpen = true;
      state.groupId = action.payload.groupId;
      state.currentStep = 1;
    },
    closeWizard: (state) => {
      state.isOpen = false;
    },

    nextStep: (state) => {
      state.currentStep = Math.min(state.currentStep + 1, 4);
    },
    prevStep: (state) => {
      state.currentStep = Math.max(state.currentStep - 1, 1);
    },
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = Math.max(1, Math.min(action.payload, 4));
    },

    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    setAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
      if (state.splitType === "equal" && state.splits.length > 0) {
        const perPerson = action.payload / state.splits.length;
        state.splits = state.splits.map((s) => ({ ...s, amount: perPerson }));
      }
    },

    togglePayer: (state, action: PayloadAction<{ userId: string; userName: string }>) => {
      const { userId, userName } = action.payload;
      const exists = state.payments.find((p) => p.userId === userId);
      if (exists) {
        state.payments = state.payments.filter((p) => p.userId !== userId);
      } else {
        state.payments.push({ userId, userName, amount: 0 });
      }
    },
    setPayerAmount: (state, action: PayloadAction<{ userId: string; amount: number }>) => {
      const { userId, amount } = action.payload;
      const payer = state.payments.find((p) => p.userId === userId);
      if (payer) {
        payer.amount = amount;
      }
    },

    setSplitType: (state, action: PayloadAction<"equal" | "custom">) => {
      state.splitType = action.payload;
      if (action.payload === "equal" && state.splits.length > 0) {
        const perPerson = state.amount / state.splits.length;
        state.splits = state.splits.map((s) => ({ ...s, amount: perPerson }));
      }
    },
    toggleSplitter: (state, action: PayloadAction<{ userId: string; userName: string }>) => {
      const { userId, userName } = action.payload;
      const exists = state.splits.find((s) => s.userId === userId);
      if (exists) {
        state.splits = state.splits.filter((s) => s.userId !== userId);
      } else {
        const newAmount =
          state.splitType === "equal" ? state.amount / (state.splits.length + 1) : 0;
        state.splits.push({ userId, userName, amount: newAmount });
      }

      if (state.splitType === "equal" && state.splits.length > 0) {
        const amountPerPerson = state.amount / state.splits.length;
        state.splits = state.splits.map((s) => ({ ...s, amount: amountPerPerson }));
      }
    },
    setSplitterAmount: (state, action: PayloadAction<{ userId: string; amount: number }>) => {
      const { userId, amount } = action.payload;
      const splitter = state.splits.find((s) => s.userId === userId);
      if (splitter) {
        splitter.amount = amount;
      }
    },

    resetWizard: () => initialState,
  },
});

export const {
  openWizard,
  closeWizard,
  nextStep,
  prevStep,
  goToStep,
  setDescription,
  setAmount,
  togglePayer,
  setPayerAmount,
  setSplitType,
  toggleSplitter,
  setSplitterAmount,
  resetWizard,
} = expenseSlice.actions;

export default expenseSlice.reducer;
