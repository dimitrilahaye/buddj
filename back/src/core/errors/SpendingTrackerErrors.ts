export class SpendingTrackerRangeError extends Error {
  constructor() {
    super("La date de début doit précéder la date de fin");
    this.name = "SpendingTrackerRangeError";
  }
}
