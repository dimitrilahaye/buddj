export default class YearlyOutflow {
  readonly id: string;
  readonly month: number;
  readonly label: string;
  readonly amount: number;
  readonly type = "outflow";

  constructor(props: {
    id: string;
    month: number;
    label: string;
    amount: number;
  }) {
    this.id = props.id;
    this.month = props.month;
    this.label = props.label;
    this.amount = props.amount;
  }
}
