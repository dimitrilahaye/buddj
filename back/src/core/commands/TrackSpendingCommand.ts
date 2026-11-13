import { TrackedSpendingKind } from "../models/spending-tracker/TrackedSpending.js";

export default interface TrackSpendingCommand {
  kind: TrackedSpendingKind;
  sourceId: string;
  label: string;
  amount: number;
  occurredAt: Date;
}
