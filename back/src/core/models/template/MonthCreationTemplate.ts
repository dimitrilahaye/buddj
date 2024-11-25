import WeeklyBudgetTemplate from "./WeeklyBudgetTemplate.js";
import OutflowTemplate from "./OutflowTemplate.js";
import {
  MonthCreationOutflowsError,
  MonthCreationTemplateWeeklyBudgetError,
} from "../../errors/MonthCreationTemplateErrors.js";

export default class MonthCreationTemplate {
  month: Date;
  startingBalance: number;
  weeklyBudgets: WeeklyBudgetTemplate[];
  outflows: OutflowTemplate[];

  constructor(props: {
    weeklyBudgets: WeeklyBudgetTemplate[];
    outflows: OutflowTemplate[];
  }) {
    this.month = new Date();
    this.startingBalance = 0;
    if (props.weeklyBudgets.length !== 5) {
      throw new MonthCreationTemplateWeeklyBudgetError();
    }
    if (props.outflows.length === 0) {
      throw new MonthCreationOutflowsError();
    }
    this.weeklyBudgets = props.weeklyBudgets;
    this.outflows = props.outflows;
  }

  addMonthlyProjectForAmount(amount: number) {
    this.outflows.push(
      new OutflowTemplate({
        label: "Projets mensuels",
        amount: amount,
      })
    );
  }
}
