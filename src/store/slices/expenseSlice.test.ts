// @ts-nocheck

import reducer, {
  openWizard,
  closeWizard,
  nextStep,
  prevStep,
  setDescription,
  setAmount,
  resetWizard,
} from "./expenseSlice";

describe("expenseSlice", () => {
  const initialState = {
    isOpen: false,
    groupId: null,
    currentStep: 1,
    description: "",
    amount: 0,
    payments: [],
    splits: [],
    splitType: "equal" as const,
    lastDeleted: null,
  };

  it("opens wizard", () => {
    const state = reducer(initialState, openWizard({ groupId: "group1" }));

    expect(state.isOpen).toBe(true);
    expect(state.groupId).toBe("group1");
  });

  it("closes wizard", () => {
    const openState = { ...initialState, isOpen: true };
    const state = reducer(openState, closeWizard());

    expect(state.isOpen).toBe(false);
  });

  it("nextStep max 4", () => {
    let state = reducer({ ...initialState, currentStep: 4 }, nextStep());
    expect(state.currentStep).toBe(4);
  });

  it("prevStep min 1", () => {
    let state = reducer(initialState, prevStep());
    expect(state.currentStep).toBe(1);
  });

  it("setDescription works", () => {
    const state = reducer(initialState, setDescription("Market"));
    expect(state.description).toBe("Market");
  });

  it("setAmount works", () => {
    const state = reducer(initialState, setAmount(250));
    expect(state.amount).toBe(250);
  });

  it("reset wizard state", () => {
    const modified = { ...initialState, isOpen: true, amount: 100 };
    const state = reducer(modified, resetWizard());
    expect(state).toEqual(initialState);
  });
});
