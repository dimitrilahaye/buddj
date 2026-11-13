export type SpendingTrackerGranularity = "day" | "week" | "month";

export default interface GetSpendingTrackerCommand {
  granularity: SpendingTrackerGranularity;
  /** Jour calendaire de début (inclus), au format YYYY-MM-DD, heure de Paris */
  from: string;
  /** Jour calendaire de fin (inclus), au format YYYY-MM-DD, heure de Paris */
  to: string;
}
