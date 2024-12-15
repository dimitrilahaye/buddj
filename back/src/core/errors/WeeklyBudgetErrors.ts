class WeeklyBudgetInitialBalanceError extends Error {
  constructor() {
    super("WeeklyBudget: initial balance should be greater than 0");
    this.name = "WeeklyBudgetInitialBalanceError";
  }
}

class WeeklyBudgetNotFoundError extends Error {
  constructor() {
    super("WeeklyBudget: not found");
    this.name = "WeeklyBudgetNotFoundError";
  }
}

class AccountBudgetNameCantBeEmptyError extends Error {
  constructor() {
    super("AccountBudget: the name can not be empty");
    this.name = "AccountBudgetNameCantBeEmptyError";
  }
}

export {
  WeeklyBudgetInitialBalanceError,
  WeeklyBudgetNotFoundError,
  AccountBudgetNameCantBeEmptyError,
};
