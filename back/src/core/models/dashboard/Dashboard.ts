import Account from "../month/account/Account.js";
import WeeklyBudgetsDashboard from "./WeeklyBudgetsDashboard.js";
import AccountDashboard from "./AccountDashboard.js";

export default class Dashboard {
    account: AccountDashboard;
    weeks: WeeklyBudgetsDashboard;

    constructor(props: { account: Account }) {
        this.account = new AccountDashboard({account: props.account});
        this.weeks = new WeeklyBudgetsDashboard({weeklyBudgets: props.account.weeklyBudgets});
    }
}
