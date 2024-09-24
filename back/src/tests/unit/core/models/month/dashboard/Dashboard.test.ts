import expect from "../../../../../test-helpers.js";
import Account from "../../../../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../../../../core/models/month/account/WeeklyBudget.js";
import AccountDashboard from "../../../../../../core/models/dashboard/AccountDashboard.js";
import WeeklyBudgetsDashboard from "../../../../../../core/models/dashboard/WeeklyBudgetsDashboard.js";
import Dashboard from "../../../../../../core/models/dashboard/Dashboard.js";

describe('Unit | Core | Models | Dashboard | Dashboard', () => {
    describe('#constructor', () => {
        it('should return a dashboard with right data', () => {
            // given
            const props = {
                account: new Account({
                    id: 'uuid',
                    currentBalance: 2000,
                    outflows: [
                        new AccountOutflow({
                            id: 'uuid',
                            label: 'outlfow',
                            amount: 10.05,
                            isChecked: true,
                        }),
                    ],
                    weeklyBudgets: [
                        new WeeklyBudget({
                            id: 'uuid',
                            name: 'Semaine 1',
                            initialBalance: 200,
                        }),
                        new WeeklyBudget({
                            id: 'uuid',
                            name: 'Semaine 2',
                            initialBalance: 200,
                        }),
                        new WeeklyBudget({
                            id: 'uuid',
                            name: 'Semaine 3',
                            initialBalance: 200,
                        }),
                        new WeeklyBudget({
                            id: 'uuid',
                            name: 'Semaine 4',
                            initialBalance: 200,
                        }),
                        new WeeklyBudget({
                            id: 'uuid',
                            name: 'Semaine 5',
                            initialBalance: 200,
                        }),
                    ],
                }),
            };

            // when
            const dashboard = new Dashboard(props);

            // then
            expect(dashboard.account).to.be.instanceof(AccountDashboard);
            expect(dashboard.weeks).to.be.instanceof(WeeklyBudgetsDashboard);
        });
    });
});
