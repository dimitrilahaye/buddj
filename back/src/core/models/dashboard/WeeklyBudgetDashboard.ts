import WeeklyBudget from "../month/account/WeeklyBudget.js";

export default class WeeklyBudgetDashboard {
    weekName: string;
    currentBalance: number;

    constructor(props: { weekName: string, initialBalance: number, weeklyBudget: WeeklyBudget }) {
        this.weekName = props.weekName;

        const sumOfAllExpensesAmount = props.weeklyBudget.expenses.reduce((prev, curr) => prev + curr.amount, 0);
        this.currentBalance = props.initialBalance - sumOfAllExpensesAmount;
    }
}
