import MonthlyBudgetTemplate from "./MonthlyBudgetTemplate.js";
import MonthlyOutflowTemplate from "./MonthlyOutflowTemplate.js";
import {
  MonthlyTemplateOutflowsError,
  MonthlyTemplateNameCanNotBeEmptyError,
} from "../../errors/MonthlyTemplateErrors.js";
import IdProvider from "../../ports/providers/IdProvider.js";

export default class MonthlyTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  budgets: MonthlyBudgetTemplate[] = [];
  outflows: MonthlyOutflowTemplate[] = [];
  month: Date;
  startingBalance: number;

  constructor(props: {
    id: string;
    budgets?: MonthlyBudgetTemplate[];
    outflows?: MonthlyOutflowTemplate[];
    isDefault: boolean;
    name: string;
  }) {
    this.id = props.id;
    this.month = new Date();
    this.startingBalance = 0;
    this.isDefault = props.isDefault;
    this.name = props.name;

    if (props.budgets) {
      this.budgets = props.budgets;
    }
    if (props.outflows) {
      if (props.outflows.length === 0) {
        throw new MonthlyTemplateOutflowsError();
      }
      this.outflows = props.outflows;
    }
  }

  updateName(name: string) {
    if (name.length === 0) {
      throw new MonthlyTemplateNameCanNotBeEmptyError();
    }
    this.name = name;
  }

  updateIsDefault(isDefault: boolean) {
    this.isDefault = isDefault;
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
