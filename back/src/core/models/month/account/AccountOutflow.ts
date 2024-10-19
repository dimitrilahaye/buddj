export default class AccountOutflow {
  id: string;
  amount: number;
  label: string;
  isChecked: boolean;

  constructor(props: {
    id: string;
    label: string;
    amount: number;
    isChecked?: boolean;
  }) {
    this.id = props.id;
    this.label = props.label;
    this.amount = props.amount;
    this.isChecked = props.isChecked ?? false;
  }

  check() {
    this.isChecked = true;
  }

  uncheck() {
    this.isChecked = false;
  }
}
