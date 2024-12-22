export default class AccountOutflow {
  id: string;
  amount: number;
  label: string;
  isChecked: boolean;
  pendingFrom: Date | null = null;

  constructor(props: {
    id: string;
    label: string;
    amount: number;
    isChecked?: boolean;
    pendingFrom?: Date;
  }) {
    this.id = props.id;
    this.label = props.label;
    this.amount = props.amount;
    this.isChecked = props.isChecked ?? false;
    if (props.pendingFrom) {
      this.pendingFrom = props.pendingFrom;
    }
  }

  isPending() {
    return this.pendingFrom !== null;
  }

  check() {
    this.isChecked = true;
  }

  uncheck() {
    this.isChecked = false;
  }
}
