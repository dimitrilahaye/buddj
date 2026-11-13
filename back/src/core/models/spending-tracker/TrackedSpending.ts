export type TrackedSpendingKind = "expense" | "outflow";

export default class TrackedSpending {
  id: string;
  kind: TrackedSpendingKind;
  sourceId: string;
  label: string;
  amount: number;
  occurredAt: Date;

  constructor(props: {
    id: string;
    kind: TrackedSpendingKind;
    sourceId: string;
    label: string;
    amount: number;
    occurredAt: Date;
  }) {
    this.id = props.id;
    this.kind = props.kind;
    this.sourceId = props.sourceId;
    this.label = props.label;
    this.amount = props.amount;
    this.occurredAt = props.occurredAt;
  }
}
