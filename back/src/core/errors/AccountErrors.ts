class AccountInitialBalanceError extends Error {
  constructor() {
    super("Le solde initial doit être positif");
    this.name = "AccountInitialBalanceError";
  }
}

export { AccountInitialBalanceError };
