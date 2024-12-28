class MonthNotFoundError extends Error {
  constructor() {
    super("Mois inconnu");
    this.name = "MonthNotFoundError";
  }
}

export { MonthNotFoundError };
