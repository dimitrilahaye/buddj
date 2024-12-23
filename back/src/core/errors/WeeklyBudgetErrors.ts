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

class AccountBudgetCanNotBeRemovedError extends Error {
  constructor() {
    super("AccountBudget: this budget can not be removed");
    this.name = "AccountBudgetCanNotBeRemovedError";
  }
}

export {
  WeeklyBudgetNotFoundError,
  AccountBudgetNameCantBeEmptyError,
  AccountBudgetCanNotBeRemovedError,
};
