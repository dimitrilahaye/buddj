import AccountOutflow from "../month/account/AccountOutflow.js";

export default class PendingOutflow {
  readonly id: string;
  readonly label: string;
  readonly amount: number;

  constructor(outflow: AccountOutflow, monthDate: Date) {
    this.id = outflow.id;
    this.amount = outflow.amount;
    const date = monthDate;
    const options = { year: "numeric", month: "short" };
    const formattedDate = date.toLocaleDateString(
      "fr-FR",
      options as Intl.DateTimeFormatOptions
    );
    this.label = `${outflow.label} (${formattedDate})`;
  }
}
