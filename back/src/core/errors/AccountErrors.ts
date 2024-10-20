class AccountInitialBalanceError extends Error {
  constructor() {
    super("Account: initial balance should be greater than 0");
    this.name = "AccountInitialBalanceError";
  }
}

class AccountWeeklyBudgetsError extends Error {
  constructor() {
    super("Account: should contain 5 weekly budgets");
    this.name = "AccountWeeklyBudgetsError";
  }
}

class AccountOutflowsError extends Error {
  constructor() {
    super("Account: should contain at least one outflow");
    this.name = "AccountOutflowsError";
  }
}

export {
  AccountInitialBalanceError,
  AccountOutflowsError,
  AccountWeeklyBudgetsError,
};
