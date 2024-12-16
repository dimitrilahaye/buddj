export default class YearlyBudget {
  readonly id: string;
  readonly month: number;
  readonly name: string;
  readonly initialBalance: number;
  readonly type = "budget";

  constructor(props: {
    id: string;
    month: number;
    name: string;
    initialBalance: number;
  }) {
    this.id = props.id;
    this.month = props.month;
    this.name = props.name;
    this.initialBalance = props.initialBalance;
  }
}
