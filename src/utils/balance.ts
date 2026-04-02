type Expense = {
  payments: { userId: string; amount: number }[];
  splits: { userId: string; amount: number }[];
};

type Debt = {
  payerId: string;
  borrowerId: string;
  amount: number;
};

export function calculateDebts(expenses: Expense[]): Debt[] {
  const debtMap: Record<string, Record<string, number>> = {};

  for (const expense of expenses) {
    const totalExpenseAmount = expense.splits.reduce((sum, share) => sum + share.amount, 0);
    if (totalExpenseAmount <= 0) continue;

    for (const payment of expense.payments) {
      if (payment.amount <= 0) continue;
      const payer = payment.userId;

      for (const personShare of expense.splits) {
        if (personShare.userId === payer) continue;
        if (personShare.amount <= 0) continue;

        const debtor = personShare.userId;
        const debtAmount = payment.amount * (personShare.amount / totalExpenseAmount);

        debtMap[payer] = debtMap[payer] || {};
        debtMap[payer][debtor] = (debtMap[payer][debtor] || 0) + debtAmount;
      }
    }
  }

  const result: Debt[] = [];
  const processed = new Set<string>();

  for (const userA of Object.keys(debtMap)) {
    for (const userB of Object.keys(debtMap[userA])) {
      const pairKey = [userA, userB].sort().join("-");
      if (processed.has(pairKey)) continue;
      processed.add(pairKey);

      const amountOwedToUserA = debtMap[userA]?.[userB] || 0;
      const amountOwedToUserB = debtMap[userB]?.[userA] || 0;
      const netAmount = amountOwedToUserA - amountOwedToUserB;

      if (Math.abs(netAmount) > 0.01) {
        result.push({
          payerId: netAmount > 0 ? userA : userB,
          borrowerId: netAmount > 0 ? userB : userA,
          amount: Math.round(Math.abs(netAmount) * 100) / 100,
        });
      }
    }
  }

  return result;
}

export function getUserDebts(debts: Debt[], userId: string) {
  return {
    theyOweMe: debts
      .filter((d) => d.payerId === userId)
      .map((d) => ({ userId: d.borrowerId, amount: d.amount })),

    iOwe: debts
      .filter((d) => d.borrowerId === userId)
      .map((d) => ({ userId: d.payerId, amount: d.amount })),
  };
}

export function getNetBalance(debts: Debt[], userId: string): number {
  const { theyOweMe, iOwe } = getUserDebts(debts, userId);
  const totalOwed = theyOweMe.reduce((sum, d) => sum + d.amount, 0);
  const totalOwing = iOwe.reduce((sum, d) => sum + d.amount, 0);
  return Math.round((totalOwed - totalOwing) * 100) / 100;
}
