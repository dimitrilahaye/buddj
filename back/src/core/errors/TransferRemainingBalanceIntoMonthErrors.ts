class TransferRemainingBalanceIntoMonthError extends Error {
  constructor() {
    super("TransferRemainingBalanceIntoMonth: invalid command");
    this.name = "TransferRemainingBalanceIntoMonthError";
  }
}

export { TransferRemainingBalanceIntoMonthError };
