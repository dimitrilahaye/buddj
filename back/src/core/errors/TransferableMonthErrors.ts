class TransferableAccountNotFoundError extends Error {
  constructor() {
    super("TransferableAccount: not found");
    this.name = "TransferableAccountNotFoundError";
  }
}

class TransferableWeeklyBudgetNotFoundError extends Error {
  constructor() {
    super("TransferableWeeklyBudget: not found");
    this.name = "TransferableWeeklyBudgetNotFoundError";
  }
}

export {
  TransferableAccountNotFoundError,
  TransferableWeeklyBudgetNotFoundError,
};
