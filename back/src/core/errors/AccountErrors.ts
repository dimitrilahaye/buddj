class AccountInitialBalanceError extends Error {
  constructor() {
    super("Account: initial balance should be greater than 0");
    this.name = "AccountInitialBalanceError";
  }
}

export { AccountInitialBalanceError };
