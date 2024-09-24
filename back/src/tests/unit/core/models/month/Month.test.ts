import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import Account from "../../../../../core/models/month/account/Account.js";
import Month from "../../../../../core/models/month/Month.js";
import AccountOutflow from "../../../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../../../core/models/month/account/WeeklyBudget.js";
import Dashboard from "../../../../../core/models/dashboard/Dashboard.js";
import WeeklyExpense from "../../../../../core/models/month/account/WeeklyExpense.js";

describe("Unit | Core | Models | Month | Month", function () {
    describe("#constructor", function () {
        it("should give a month with right data", function () {
            // given
            const props = {
                id: 'uuid',
                date: new Date(),
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
            const month = new Month(props);

            // then
            expect(month).to.deep.equal({
                ...props,
                startAt: null,
                endAt: null,
                isArchived: false,
            });
        });
    });

    describe('#addExpenseToWeeklyBudget', function () {
        it('should call its account to add the new expense', function () {
            // given
            const givenDate = new Date();
            const newExpense = new WeeklyExpense({
                id: 'uuid',
                amount: 10,
                label: 'JOW',
                isChecked: true,
                date: givenDate,
            });
            const targetedWeeklyBudget = 'right-uuid';
            const accountStub = new Account({
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
                        id: targetedWeeklyBudget,
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
            accountStub.addExpenseToWeeklyBudget = sinon.stub().withArgs(targetedWeeklyBudget, newExpense);
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.addExpenseToWeeklyBudget(targetedWeeklyBudget, newExpense);

            // then
            expect(accountStub.addExpenseToWeeklyBudget).to.have.been.calledOnceWith(targetedWeeklyBudget, newExpense);
        });
    });

    describe('#deleteExpenseFromWeeklyBudget', function () {
        it('should call its account to add delete the expense', function () {
            // given
            const expenseIdToDelete = 'expense-id';
            const expenseToDelete = new WeeklyExpense({
                id: expenseIdToDelete,
                amount: 10,
                label: 'JOW',
                isChecked: true,
                date: new Date(),
            });
            const targetedWeeklyBudgetId = 'right-uuid';
            const accountStub = new Account({
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
                        id: targetedWeeklyBudgetId,
                        name: 'Semaine 1',
                        initialBalance: 200,
                        expenses: [expenseToDelete],
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
            accountStub.deleteExpenseFromWeeklyBudget = sinon.stub().withArgs(targetedWeeklyBudgetId, expenseIdToDelete);
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.deleteExpenseFromWeeklyBudget(targetedWeeklyBudgetId, expenseIdToDelete);

            // then
            expect(accountStub.deleteExpenseFromWeeklyBudget).to.have.been.calledOnceWith(targetedWeeklyBudgetId, expenseIdToDelete);
        });
    });

    describe('#checkExpense', function () {
        it('should call its account to check the expense', function () {
            // given
            const givenDate = new Date();
            const targetedWeeklyExpenseId = 'expense-id';
            const existingExpense = new WeeklyExpense({
                id: targetedWeeklyExpenseId,
                amount: 10,
                label: 'JOW',
                isChecked: false,
                date: givenDate,
            });
            const targetedWeeklyBudgetId = 'weekly-budget-id';
            const accountStub = new Account({
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
                        id: targetedWeeklyBudgetId,
                        name: 'Semaine 1',
                        initialBalance: 200,
                        expenses: [existingExpense],
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
            accountStub.checkExpense = sinon.stub().withArgs(targetedWeeklyBudgetId, targetedWeeklyExpenseId);
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.checkExpense(targetedWeeklyBudgetId, targetedWeeklyExpenseId);

            // then
            expect(accountStub.checkExpense).to.have.been.calledOnceWith(targetedWeeklyBudgetId, targetedWeeklyExpenseId);
        });
    });

    describe('#uncheckExpense', function () {
        it('should call its account to check the expense', function () {
            // given
            const givenDate = new Date();
            const targetedWeeklyExpenseId = 'expense-id';
            const existingExpense = new WeeklyExpense({
                id: targetedWeeklyExpenseId,
                amount: 10,
                label: 'JOW',
                isChecked: false,
                date: givenDate,
            });
            const targetedWeeklyBudgetId = 'weekly-budget-id';
            const accountStub = new Account({
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
                        id: targetedWeeklyBudgetId,
                        name: 'Semaine 1',
                        initialBalance: 200,
                        expenses: [existingExpense],
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
            accountStub.uncheckExpense = sinon.stub().withArgs(targetedWeeklyBudgetId, targetedWeeklyExpenseId);
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.uncheckExpense(targetedWeeklyBudgetId, targetedWeeklyExpenseId);

            // then
            expect(accountStub.uncheckExpense).to.have.been.calledOnceWith(targetedWeeklyBudgetId, targetedWeeklyExpenseId);
        });
    });

    describe('#updateAccountCurrentBalance', function () {
        it('should call its account update its current balance', function () {
            // given
            const givenNewCurrentBalance = 1000;
            const accountStub = new Account({
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
            });
            accountStub.updateCurrentBalance = sinon.stub();
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.updateAccountCurrentBalance(givenNewCurrentBalance);

            // then
            expect(accountStub.updateCurrentBalance).to.have.been.calledOnceWith(givenNewCurrentBalance);
        });
    });

    describe('#checkOutflow', function () {
        it('should call its account to check the outflow', function () {
            // given
            const targetedOutflowId = 'outflow-id';
            const targetedOutflow = new AccountOutflow({
                id: 'uuid',
                label: 'outlfow',
                amount: 10.05,
                isChecked: false,
            });
            const accountStub = new Account({
                id: 'uuid',
                currentBalance: 2000,
                outflows: [
                    targetedOutflow,
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
            accountStub.checkOutflow = sinon.stub().withArgs(targetedOutflowId);
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.checkOutflow(targetedOutflowId);

            // then
            expect(accountStub.checkOutflow).to.have.been.calledOnceWith(targetedOutflowId);
        });
    });

    describe('#uncheckExpense', function () {
        it('should call its account to check the expense', function () {
            // given
            const targetedOutflowId = 'outflow-id';
            const targetedOutflow = new AccountOutflow({
                id: 'uuid',
                label: 'outlfow',
                amount: 10.05,
                isChecked: true,
            });
            const accountStub = new Account({
                id: 'uuid',
                currentBalance: 2000,
                outflows: [
                    targetedOutflow,
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
            accountStub.uncheckOutflow = sinon.stub().withArgs(targetedOutflowId);
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.uncheckOutflow(targetedOutflowId);

            // then
            expect(accountStub.uncheckOutflow).to.have.been.calledOnceWith(targetedOutflowId);
        });
    });

    describe('#updateExpenseAmountFromWeeklyBudget', function () {
       it('should call the account to update the expense amount', () => {
           // given
           const targetedWeeklyExpenseId = 'expense-id';
           const existingExpense = new WeeklyExpense({
               id: targetedWeeklyExpenseId,
               amount: 10,
               label: 'JOW',
               isChecked: false,
               date: new Date(),
           });
           const targetedWeeklyBudgetId = 'weekly-budget-id';
           const accountStub = new Account({
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
                       id: targetedWeeklyBudgetId,
                       name: 'Semaine 1',
                       initialBalance: 200,
                       expenses: [existingExpense],
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
           accountStub.updateExpenseAmountFromWeeklyBudget = sinon.stub();
           const props = {
               id: 'uuid',
               date: new Date(),
               account: accountStub,
           };
           const month = new Month(props);

           // when
           month.updateExpenseAmountFromWeeklyBudget(targetedWeeklyBudgetId, targetedWeeklyExpenseId, 10);

           // then
           expect(accountStub.updateExpenseAmountFromWeeklyBudget).to.have.been.calledOnceWith(targetedWeeklyBudgetId, targetedWeeklyExpenseId, 10);
       });
    });

    describe('#updateExpenseLabelFromWeeklyBudget', function () {
        it('should call the account to update the expense label', () => {
            // given
            const targetedWeeklyExpenseId = 'expense-id';
            const existingExpense = new WeeklyExpense({
                id: targetedWeeklyExpenseId,
                amount: 10,
                label: 'JOW',
                isChecked: false,
                date: new Date(),
            });
            const targetedWeeklyBudgetId = 'weekly-budget-id';
            const accountStub = new Account({
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
                        id: targetedWeeklyBudgetId,
                        name: 'Semaine 1',
                        initialBalance: 200,
                        expenses: [existingExpense],
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
            accountStub.updateExpenseLabelFromWeeklyBudget = sinon.stub();
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.updateExpenseLabelFromWeeklyBudget(targetedWeeklyBudgetId, targetedWeeklyExpenseId, 'JODI');

            // then
            expect(accountStub.updateExpenseLabelFromWeeklyBudget).to.have.been.calledOnceWith(targetedWeeklyBudgetId, targetedWeeklyExpenseId, 'JODI');
        });
    });

    describe('#updateExpenseWeeklyBudget', function () {
        it('should call the account to change the weekly of the expense', () => {
            // given
            const targetedWeeklyExpenseId = 'expense-id';
            const existingExpense = new WeeklyExpense({
                id: targetedWeeklyExpenseId,
                amount: 10,
                label: 'JOW',
                isChecked: false,
                date: new Date(),
            });
            const oldWeeklyBudgetId = 'old-weekly-budget-id';
            const newWeeklyBudgetId = 'new-weekly-budget-id';
            const accountStub = new Account({
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
                        id: oldWeeklyBudgetId,
                        name: 'Semaine 1',
                        initialBalance: 200,
                        expenses: [existingExpense],
                    }),
                    new WeeklyBudget({
                        id: newWeeklyBudgetId,
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
            accountStub.updateExpenseWeeklyBudget = sinon.stub();
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.updateExpenseWeeklyBudget(oldWeeklyBudgetId, newWeeklyBudgetId, targetedWeeklyExpenseId);

            // then
            expect(accountStub.updateExpenseWeeklyBudget).to.have.been.calledOnceWith(oldWeeklyBudgetId, newWeeklyBudgetId, targetedWeeklyExpenseId);
        });
    });

    describe('#deleteOutflow', () => {
        it('should call the account to delete outflow', () => {
            // given
            const targetedOutflowId = 'outflow-id';
            const accountStub = new Account({
                id: 'uuid',
                currentBalance: 2000,
                outflows: [
                    new AccountOutflow({
                        id: targetedOutflowId,
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
            });
            accountStub.deleteOutflow = sinon.stub();
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.deleteOutflow(targetedOutflowId);

            // then
            expect(accountStub.deleteOutflow).to.have.been.calledOnceWith(targetedOutflowId);
        });
    });

    describe('#addOutflow', () => {
        it('should call the account to add outflow', () => {
            // given
            const newOutflow = new AccountOutflow({
                id: 'uuid',
                label: 'TAN',
                amount: 10,
            });
            const accountStub = new Account({
                id: 'uuid',
                currentBalance: 2000,
                outflows: [
                    new AccountOutflow({
                        id: 'uuid',
                        label: 'EDF',
                        amount: 100,
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
            accountStub.addOutflow = sinon.stub();
            const props = {
                id: 'uuid',
                date: new Date(),
                account: accountStub,
            };
            const month = new Month(props);

            // when
            month.addOutflow(newOutflow);

            // then
            expect(accountStub.addOutflow).to.have.been.calledOnceWith(newOutflow);
        });
    });

    describe('#archive', function () {
        it('should set isArchived to true', function () {
            // given
            const month = new Month({
                id: 'uuid',
                date: new Date(),
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
            });

            // when
            month.archive();

            // then
            expect(month.isArchived).to.be.true;
        });
    });

    describe("#dashboard", function () {
        it("should give a dashboard", function () {
            // given
            const props = {
                id: 'uuid',
                date: new Date(),
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
                        new AccountOutflow({
                            id: 'uuid',
                            label: 'outlfow 2',
                            amount: 20,
                        }),
                    ],
                    weeklyBudgets: [
                        new WeeklyBudget({
                            id: 'uuid',
                            name: 'Semaine 1',
                            initialBalance: 200,
                            expenses: [
                                new WeeklyExpense({
                                    id: 'uuid',
                                    label: 'JOW',
                                    amount: 10,
                                    date: new Date(),
                                    isChecked: true,
                                }),
                                new WeeklyExpense({
                                    id: 'uuid',
                                    label: 'JOW',
                                    amount: 20,
                                    date: new Date(),
                                    isChecked: true,
                                }),
                                new WeeklyExpense({
                                    id: 'uuid',
                                    label: 'JOW',
                                    amount: 40,
                                    date: new Date(),
                                    isChecked: true,
                                }),
                                new WeeklyExpense({
                                    id: 'uuid',
                                    label: 'JOW',
                                    amount: 70,
                                    date: new Date(),
                                    isChecked: false,
                                }),
                                new WeeklyExpense({
                                    id: 'uuid',
                                    label: 'JOW',
                                    amount: 10,
                                    date: new Date(),
                                    isChecked: false,
                                }),
                                new WeeklyExpense({
                                    id: 'uuid',
                                    label: 'JOW',
                                    amount: 60,
                                    date: new Date(),
                                    isChecked: false,
                                }),
                            ]
                        }),
                        new WeeklyBudget({
                            id: 'uuid',
                            name: 'Semaine 2',
                            initialBalance: 200,
                            expenses: [
                                new WeeklyExpense({
                                    id: 'uuid',
                                    label: 'JOW',
                                    amount: 20,
                                    date: new Date(),
                                    isChecked: true,
                                }),
                                new WeeklyExpense({
                                    id: 'uuid',
                                    label: 'JOW',
                                    amount: 40,
                                    date: new Date(),
                                    isChecked: false,
                                }),
                            ],
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
            const month = new Month(props);

            // when
            const dashboard = month.dashboard();

            // then
            expect(dashboard).to.be.instanceof(Dashboard);
            expect(dashboard.account.forecastBalance).to.be.equal(1060);
            expect(dashboard.account.currentBalance).to.be.equal(2000);
            expect(dashboard.weeks.forecastBalance).to.be.equal(730);
            const [s1, s2, s3, s4, s5] = dashboard.weeks.weeklyBudgets;
            expect(s1.currentBalance).to.be.equal(-10);
            expect(s2.currentBalance).to.be.equal(140);
            expect(s3.currentBalance).to.be.equal(200);
            expect(s4.currentBalance).to.be.equal(200);
            expect(s5.currentBalance).to.be.equal(200);
        });
    });

    describe('#unarchive', function () {
        it('should set isArchived to false', function () {
            // given
            const month = new Month({
                id: 'uuid',
                date: new Date(),
                isArchived: true,
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
            });

            // when
            month.unarchive();

            // then
            expect(month.isArchived).to.be.false;
        });
    });
});
