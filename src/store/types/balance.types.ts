export type Payment = {
  userId: string;
  amount: number;
};

export type Split = {
  userId: string;
  amount: number;
};

export type Expense = {
  payments: Payment[];
  splits: Split[];
};

export type Balance = Record<string, number>;

export type Debt = {
  from: string;
  to: string;
  amount: number;
};
