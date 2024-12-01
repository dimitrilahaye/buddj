import MonthlyBudgetTemplate from "./MonthlyBudgetTemplate.js";
import MonthlyOutflowTemplate from "./MonthlyOutflowTemplate.js";
import {
  MonthlyTemplateOutflowsError,
  MonthlyTemplateBudgetError,
} from "../../errors/MonthlyTemplateErrors.js";
import IdProvider from "../../ports/providers/IdProvider.js";

export default class MonthlyTemplate {
  id: string;
  month: Date;
  startingBalance: number;
  budgets: MonthlyBudgetTemplate[];
  outflows: MonthlyOutflowTemplate[];
  isDefault: boolean;
  name: string;

  constructor(props: {
    id: string;
    budgets: MonthlyBudgetTemplate[];
    outflows: MonthlyOutflowTemplate[];
    isDefault: boolean;
    name: string;
  }) {
    this.id = props.id;
    this.month = new Date();
    this.startingBalance = 0;
    this.isDefault = props.isDefault;
    this.name = props.name;

    if (props.budgets.length !== 5) {
      throw new MonthlyTemplateBudgetError();
    }
    if (props.outflows.length === 0) {
      throw new MonthlyTemplateOutflowsError();
    }
    this.budgets = props.budgets;
    this.outflows = props.outflows;
  }

  addMonthlyProjectForAmount(idProvider: IdProvider, amount: number) {
    this.outflows.push(
      new MonthlyOutflowTemplate({
        id: idProvider.get(),
        label: "Projets mensuels",
        amount: amount,
      })
    );
  }
}
