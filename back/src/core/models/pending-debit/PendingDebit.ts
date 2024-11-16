export type PendingDebitProps = {
  id: string;
  monthId: string;
  monthDate: Date;
  label: string;
  amount: number;
  type: "outflow" | "expense";
};

export default class PendingDebit {
  readonly id: string;
  readonly monthId: string;
  readonly monthDate: Date;
  readonly label: string;
  readonly amount: number;
  readonly type: string;

  constructor(props: PendingDebitProps) {
    this.id = props.id;
    this.monthId = props.monthId;
    this.monthDate = props.monthDate;
    this.amount = props.amount;
    this.type = props.type;
    const date = new Date("2022-01-01");
    const options = { year: "numeric", month: "short" };
    const formattedDate = date.toLocaleDateString(
      "fr-FR",
      options as Intl.DateTimeFormatOptions
    );
    this.label = `${props.label} (${formattedDate})`;
  }
}
