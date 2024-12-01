export default class MonthlyBudgetTemplate {
  id: string;
  name: string;
  initialBalance: number;

  constructor(props: { id: string; name: string; initialBalance: number }) {
    this.id = props.id;
    this.name = props.name;
    this.initialBalance = props.initialBalance;
  }
}
