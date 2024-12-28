class TransferableAccountNotFoundError extends Error {
  constructor() {
    super("Compte inconnu");
    this.name = "TransferableAccountNotFoundError";
  }
}

class TransferableWeeklyBudgetNotFoundError extends Error {
  constructor() {
    super("Budget inconnu");
    this.name = "TransferableWeeklyBudgetNotFoundError";
  }
}

export {
  TransferableAccountNotFoundError,
  TransferableWeeklyBudgetNotFoundError,
};
