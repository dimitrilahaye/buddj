import expect from "../../../../../test-helpers.js";
import WeeklyBudgetsDashboard from "../../../../../../core/models/dashboard/WeeklyBudgetsDashboard.js";
import {WeeklyBudgetsDashboardWeeklyBudgetsError} from "../../../../../../core/errors/WeeklyBudgetsDashboardErrors.js";
import WeeklyBudget from "../../../../../../core/models/month/account/WeeklyBudget.js";
import WeeklyBudgetDashboard from "../../../../../../core/models/dashboard/WeeklyBudgetDashboard.js";
import WeeklyExpense from "../../../../../../core/models/month/account/WeeklyExpense.js";

describe('Unit | Core | Models | Dashboard | WeeklyBudgetsDashboard', () => {
    describe('#constructor', () => {
        it('should return the weekly budgets dashboard with right data', () => {
            // given
            const props = {
                weeklyBudgets: [
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 1',
                        initialBalance: 200,
                        expenses: [
                            new WeeklyExpense({
                                id: 'uuid',
                                date: new Date(),
                                amount: 210,
                                label: 'JOW',
                                isChecked: true,
                            }),
                        ],
                    }),
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 2',
                        initialBalance: 200,
                        expenses: [
                            new WeeklyExpense({
                                id: 'uuid',
                                date: new Date(),
                                amount: 10,
                                label: 'JOW',
                                isChecked: true,
                            }),
                        ],
                    }),
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 3',
                        initialBalance: 200,
                        expenses: [
                            new WeeklyExpense({
                                id: 'uuid',
                                date: new Date(),
                                amount: 20,
                                label: 'JOW',
                                isChecked: true,
                            }),
                        ],
                    }),
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 4',
                        initialBalance: 200,
                        expenses: [
                            new WeeklyExpense({
                                id: 'uuid',
                                date: new Date(),
                                amount: 210,
                                label: 'JOW',
                                isChecked: true,
                            }),
                        ],
                    }),
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 5',
                        initialBalance: 200,
                        expenses: [],
                    }),
                ],
            };

            // when
            const weekly = new WeeklyBudgetsDashboard(props);

            // then
            expect(weekly.forecastBalance).to.be.equal(550);
            weekly.weeklyBudgets.forEach((week) => {
               expect(week).to.be.instanceof(WeeklyBudgetDashboard);
            });
        });

        it('should throw an error if it has not 5 weekly budgets', () => {
            // given
            const props = {
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
                ],
            };

            // when / then
            expect(() => new WeeklyBudgetsDashboard(props)).to.throw(WeeklyBudgetsDashboardWeeklyBudgetsError);
        });
    });
});
