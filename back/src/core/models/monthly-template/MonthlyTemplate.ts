import MonthlyBudgetTemplate from "./MonthlyBudgetTemplate.js";
import MonthlyOutflowTemplate from "./MonthlyOutflowTemplate.js";
import {
  MonthlyBudgetTemplateNotFoundError,
  MonthlyOutflowTemplateNotFoundError,
  MonthlyTemplateNameCanNotBeEmptyError,
} from "../../errors/MonthlyTemplateErrors.js";

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

  removeOutflow(outflowId: string) {
    this.outflows = this.outflows.filter((o) => o.id !== outflowId);
  }

  removeBudget(budgetId: string) {
    this.budgets = this.budgets.filter((b) => b.id !== budgetId);
  }

  updateOutflow(outflowId: string, label: string, amount: number) {
    const index = this.outflows.findIndex((o) => o.id === outflowId);
    if (index === -1) {
      throw new MonthlyOutflowTemplateNotFoundError();
    }
    const updated = new MonthlyOutflowTemplate({ id: outflowId, label, amount });
    this.outflows[index] = updated;
    return updated;
  }

  updateBudget(budgetId: string, name: string, initialBalance: number) {
    const index = this.budgets.findIndex((b) => b.id === budgetId);
    if (index === -1) {
      throw new MonthlyBudgetTemplateNotFoundError();
    }
    const updated = new MonthlyBudgetTemplate({
      id: budgetId,
      name,
      initialBalance,
    });
    this.budgets[index] = updated;
    return updated;
  }

  addOutflow(outflow: MonthlyOutflowTemplate) {
    this.outflows.push(outflow);
  }

  addBudget(budget: MonthlyBudgetTemplate) {
    this.budgets.push(budget);
  }
}
