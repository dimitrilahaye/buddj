import TrackedSpending, {
  TrackedSpendingKind,
} from "../../models/spending-tracker/TrackedSpending.js";

export default interface TrackedSpendingRepository {
  save(trackedSpending: TrackedSpending): Promise<void>;

  deleteBySource(kind: TrackedSpendingKind, sourceId: string): Promise<void>;

  /** Met à jour libellé et montant ; sans effet si la source n'est pas suivie */
  updateBySource(
    kind: TrackedSpendingKind,
    sourceId: string,
    changes: { label: string; amount: number }
  ): Promise<void>;

  /** Entrées dont `occurredAt` est dans [from, to[ */
  findBetween(from: Date, to: Date): Promise<TrackedSpending[]>;
}
