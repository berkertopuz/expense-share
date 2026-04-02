export interface WizardPayment {
  userId: string;
  userName: string;
  amount: number;
}

export interface WizardSplit {
  userId: string;
  userName: string;
  amount: number;
}

export interface ExpenseWizardState {
  isOpen: boolean;
  groupId: string | null;
  currentStep: number;
  description: string;
  amount: number;
  payments: WizardPayment[];
  splits: WizardSplit[];
  splitType: "equal" | "custom";

  lastDeleted: DeletedExpense | null;
}

export interface DeletedExpense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  payments: { userId: string; amount: number }[];
  splits: { userId: string; amount: number }[];
  deletedAt: number;
}
