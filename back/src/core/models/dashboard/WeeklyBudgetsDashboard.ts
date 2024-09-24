import WeeklyBudgetDashboard from "./WeeklyBudgetDashboard.js";
import {WeeklyBudgetsDashboardWeeklyBudgetsError} from "../../errors/WeeklyBudgetsDashboardErrors.js";
import WeeklyBudget from "../month/account/WeeklyBudget.js";
import WeeklyExpenseDashboard from "./WeeklyExpenseDashboard.js";

export default class WeeklyBudgetsDashboard {
    weeklyBudgets: WeeklyBudgetDashboard[];
    forecastBalance: number;

    constructor(props: {weeklyBudgets: WeeklyBudget[]}) {
        if (props.weeklyBudgets.length !== 5) {
            throw new WeeklyBudgetsDashboardWeeklyBudgetsError();
        }
        this.weeklyBudgets = props.weeklyBudgets.map((weekly) => new WeeklyBudgetDashboard({
            weekName: weekly.name,
            initialBalance: weekly.initialBalance,
            weeklyBudget: weekly,
        }));

        this.forecastBalance = this.weeklyBudgets.reduce((prev, curr) => {
            return prev + curr.currentBalance;
        }, 0);
    }
}
