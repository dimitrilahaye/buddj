import MonthlyOutflowTemplate from "../models/monthly-template/MonthlyOutflowTemplate.js";
import IdProvider from "../ports/providers/IdProvider.js";

export default class MonthlyOutflowFactory {
  constructor(public readonly idProvider: IdProvider) {}

  create(outflow: { amount: number; label: string }) {
    return new MonthlyOutflowTemplate({
      id: this.idProvider.get(),
      label: outflow.label,
      amount: outflow.amount,
    });
  }
}
