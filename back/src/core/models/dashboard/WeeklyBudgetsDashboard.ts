import WeeklyBudgetDashboard from "./WeeklyBudgetDashboard.js";
import WeeklyBudget from "../month/account/WeeklyBudget.js";

export default class WeeklyBudgetsDashboard {
  weeklyBudgets: WeeklyBudgetDashboard[] = [];
  forecastBalance: number;

  constructor(props: { weeklyBudgets: WeeklyBudget[] }) {
    this.weeklyBudgets = props.weeklyBudgets.map(
      (weekly) =>
        new WeeklyBudgetDashboard({
          weekName: weekly.name,
          initialBalance: weekly.initialBalance,
          weeklyBudget: weekly,
        })
    );

    this.forecastBalance = this.weeklyBudgets.reduce((prev, curr) => {
      return prev + curr.currentBalance;
    }, 0);
  }
}
