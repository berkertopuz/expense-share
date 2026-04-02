// @ts-nocheck
import { calculateDebts, getUserDebts, getNetBalance } from "./balance";

describe("calculateDebts", () => {
  it("one person pays, others split equally", () => {
    const expenses = [
      {
        payments: [{ userId: "user1", amount: 100 }],
        splits: [
          { userId: "user1", amount: 50 },
          { userId: "user2", amount: 50 },
        ],
      },
    ];

    const debts = calculateDebts(expenses);

    expect(debts).toHaveLength(1);
    expect(debts[0]).toEqual({
      payerId: "user1",
      borrowerId: "user2",
      amount: 50,
    });
  });

  it("decides who owes whom", () => {
    const expenses = [
      {
        payments: [{ userId: "user1", amount: 100 }],
        splits: [
          { userId: "user1", amount: 50 },
          { userId: "user2", amount: 50 },
        ],
      },
      {
        payments: [{ userId: "user2", amount: 30 }],
        splits: [
          { userId: "user1", amount: 15 },
          { userId: "user2", amount: 15 },
        ],
      },
    ];

    const debts = calculateDebts(expenses);

    expect(debts).toHaveLength(1);
    expect(debts[0].payerId).toBe("user1");
    expect(debts[0].borrowerId).toBe("user2");
    expect(debts[0].amount).toBe(35);
  });

  it("returns empty array for empty input", () => {
    const debts = calculateDebts([]);
    expect(debts).toEqual([]);
  });
});

describe("getUserDebts", () => {
  it("separates debts and credits for a user", () => {
    const debts = [
      { payerId: "user1", borrowerId: "user2", amount: 50 },
      { payerId: "user3", borrowerId: "user1", amount: 30 },
    ];

    const result = getUserDebts(debts, "user1");

    expect(result.theyOweMe).toEqual([{ userId: "user2", amount: 50 }]);
    expect(result.iOwe).toEqual([{ userId: "user3", amount: 30 }]);
  });

  it("returns empty array if user doesnt exist", () => {
    const debts = [{ payerId: "user1", borrowerId: "user2", amount: 50 }];

    const result = getUserDebts(debts, "user99");

    expect(result.theyOweMe).toEqual([]);
    expect(result.iOwe).toEqual([]);
  });
});

describe("getNetBalance", () => {
  it("calculates net balance", () => {
    const debts = [
      { payerId: "user1", borrowerId: "user2", amount: 50 },
      { payerId: "user3", borrowerId: "user1", amount: 30 },
    ];

    const net = getNetBalance(debts, "user1");

    expect(net).toBe(20);
  });

  it("returns negative value if user has more debts than credits", () => {
    const debts = [{ payerId: "user2", borrowerId: "user1", amount: 100 }];

    const net = getNetBalance(debts, "user1");

    expect(net).toBe(-100);
  });
});
