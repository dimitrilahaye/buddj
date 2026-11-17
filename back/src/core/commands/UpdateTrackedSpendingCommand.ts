import { TrackedSpendingKind } from "../models/spending-tracker/TrackedSpending.js";

export default interface UpdateTrackedSpendingCommand {
  kind: TrackedSpendingKind;
  sourceId: string;
  label: string;
  amount: number;
}
