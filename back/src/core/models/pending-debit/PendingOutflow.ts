import AccountOutflow from "../month/account/AccountOutflow.js";

export default class PendingOutflow {
  readonly id: string;
  readonly label: string;
  readonly amount: number;
  readonly pendingFrom: Date;

  constructor(outflow: AccountOutflow, monthDate: Date) {
    this.id = outflow.id;
    this.amount = outflow.amount;
    this.pendingFrom = monthDate;
    this.label = outflow.label;
  }
}
