import Account from "../month/account/Account.js";

export default class AccountDashboard {
    currentBalance: number;
    forecastBalance: number;

    constructor(props: { account: Account }) {
        this.currentBalance = props.account.currentBalance;
        const amountForWeeklyBudgets = props.account.weeklyBudgets.reduce((prev, curr) => {
            return prev + curr.amountForOutflow;
        }, 0);
        this.forecastBalance = this.currentBalance - props.account.outflows.filter((outflow) => !outflow.isChecked).reduce((prev, curr) => {
            return prev + curr.amount;
        }, 0) - amountForWeeklyBudgets;
    }
}
