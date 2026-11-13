import TrackedSpending, {
  TrackedSpendingKind,
} from "../../models/spending-tracker/TrackedSpending.js";

export default interface TrackedSpendingRepository {
  save(trackedSpending: TrackedSpending): Promise<void>;

  deleteBySource(kind: TrackedSpendingKind, sourceId: string): Promise<void>;

  /** Entrées dont `occurredAt` est dans [from, to[ */
  findBetween(from: Date, to: Date): Promise<TrackedSpending[]>;
}
