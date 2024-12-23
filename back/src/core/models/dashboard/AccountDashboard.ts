import Account from "../month/account/Account.js";

export default class AccountDashboard {
  currentBalance: number;
  forecastBalance: number;

  constructor(props: { account: Account }) {
    this.currentBalance = Number(props.account.currentBalance.toFixed(2));
    const amountForWeeklyBudgets = props.account.weeklyBudgets.reduce(
      (prev, curr) => {
        return prev + curr.amountForOutflow;
      },
      0
    );
    const forecastBalance =
      this.currentBalance -
      props.account.outflows
        .filter((outflow) => !outflow.isChecked)
        .reduce((prev, curr) => {
          return prev + curr.amount;
        }, 0) -
      amountForWeeklyBudgets;

    this.forecastBalance = Number(forecastBalance.toFixed(2));
  }
}
