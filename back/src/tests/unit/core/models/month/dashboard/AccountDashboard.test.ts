import expect from "../../../../../test-helpers.js";
import AccountOutflow from "../../../../../../core/models/month/account/AccountOutflow.js";
import AccountDashboard from "../../../../../../core/models/dashboard/AccountDashboard.js";
import Account from "../../../../../../core/models/month/account/Account.js";
import WeeklyBudget from "../../../../../../core/models/month/account/WeeklyBudget.js";

describe('Unit | Core | Models | Dashboard | AccountDashboard', () => {
    describe('#constructor', () => {
        it('should return an account dashboard with right data', () => {
            // given
            const accountProps = new Account({
                id: 'uuid',
                currentBalance: 2000,
                outflows: [
                    new AccountOutflow({
                        id: 'uuid',
                        label: 'EDF',
                        amount: 111,
                        isChecked: true,
                    }),
                    new AccountOutflow({
                        id: 'uuid',
                        label: 'Loyer',
                        amount: 620,
                        isChecked: false,
                    }),
                    new AccountOutflow({
                        id: 'uuid',
                        label: 'Liam',
                        amount: 20,
                        isChecked: false,
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
            });

            // when
            const account = new AccountDashboard({account: accountProps});

            // then
            expect(account).to.deep.equal({
                currentBalance: 2000,
                forecastBalance: 360,
            });
        });
    });
});
