class TransferBalanceIntoMonthError extends Error {
  constructor() {
    super("Erreur lors du transfert");
    this.name = "TransferBalanceIntoMonthError";
  }
}

export { TransferBalanceIntoMonthError };
