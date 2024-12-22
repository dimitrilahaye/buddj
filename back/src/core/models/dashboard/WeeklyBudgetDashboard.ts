import WeeklyBudget from "../month/account/WeeklyBudget.js";

export default class WeeklyBudgetDashboard {
  weekName: string;
  currentBalance: number;
  initialBalance: number;

  constructor(props: {
    weekName: string;
    initialBalance: number;
    weeklyBudget: WeeklyBudget;
  }) {
    this.weekName = props.weekName;

    const sumOfAllExpensesAmount = props.weeklyBudget.expenses.reduce(
      (prev, curr) => prev + curr.amount,
      0
    );
    this.initialBalance = Number(props.initialBalance.toFixed(2));
    this.currentBalance = Number(
      (this.initialBalance - sumOfAllExpensesAmount).toFixed(2)
    );
  }
}
