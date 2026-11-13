import { TrackedSpendingKind } from "../models/spending-tracker/TrackedSpending.js";

export default interface UntrackSpendingCommand {
  kind: TrackedSpendingKind;
  sourceId: string;
}
