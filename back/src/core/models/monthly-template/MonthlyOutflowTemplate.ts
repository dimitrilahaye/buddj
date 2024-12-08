export default class MonthlyOutflowTemplate {
  id: string;
  amount: number;
  label: string;

  constructor(props: { id: string; label: string; amount: number }) {
    this.id = props.id;
    this.label = props.label;
    this.amount = props.amount;
  }
}
