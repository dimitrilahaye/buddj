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

export { WeeklyBudgetNotFoundError, AccountBudgetNameCantBeEmptyError };
