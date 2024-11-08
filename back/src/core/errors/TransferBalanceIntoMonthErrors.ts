class TransferBalanceIntoMonthError extends Error {
  constructor() {
    super("TransferBalanceIntoMonth: invalid command");
    this.name = "TransferBalanceIntoMonthError";
  }
}

export { TransferBalanceIntoMonthError };
