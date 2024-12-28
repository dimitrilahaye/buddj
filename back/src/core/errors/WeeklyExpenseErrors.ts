class WeeklyExpenseAmountError extends Error {
  constructor() {
    super("Le montant doit être positif");
    this.name = "WeeklyExpenseAmountError";
  }
}

class WeeklyExpenseNotFoundError extends Error {
  constructor() {
    super("Sortie inconnue");
    this.name = "WeeklyExpenseNotFoundError";
  }
}

export { WeeklyExpenseAmountError, WeeklyExpenseNotFoundError };
