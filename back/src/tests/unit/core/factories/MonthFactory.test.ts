import expect from "../../../test-helpers.js";
import sinon from "sinon";
import Month from "../../../../core/models/month/Month.js";
import MonthFactory from "../../../../core/factories/MonthFactory.js";
import {AccountInitialBalanceError} from "../../../../core/errors/AccountErrors.js";

describe("Unit | Core | Factories | MonthFactory", function () {
    describe("#create", function () {
        it("should give a month with right data", function () {
            // given
            const idProvider = {
                get: sinon.stub<any, string>(),
            };
            idProvider.get.returns('uuid');

            const factory = new MonthFactory(idProvider);
            const command = {
                date: new Date(),
                initialBalance: 2000,
                outflows: [
                    {
                        label: 'outlfow',
                        amount: 10.05,
                    },
                ],
                weeklyBudgets: [
                    {
                        name: 'Semaine 1',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 2',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 3',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 4',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 5',
                        initialBalance: 200,
                    },
                ],
            };

            // when
            const month = factory.create(command);

            // then
            expect(month).to.be.instanceof(Month);
            expect(month.account.outflows).to.have.lengthOf(1);
            const weeklyBudgets = command.weeklyBudgets;
            const [, ...weeklyBudgetsForOutflow] = month.account.outflows;
            weeklyBudgetsForOutflow.forEach((outflow, i) => {
                const weeklyBudget = weeklyBudgets[i];
                expect(outflow.amount).is.equal(weeklyBudget.initialBalance);
            });
        });
        it("should throw an error if current balance is negative", function () {
            // given
            const idProvider = {
                get: sinon.stub<any, string>(),
            };
            idProvider.get.returns('uuid');

            const factory = new MonthFactory(idProvider);
            const command = {
                date: new Date(),
                initialBalance: -2000,
                outflows: [
                    {
                        label: 'outlfow',
                        amount: 10.05,
                    },
                ],
                weeklyBudgets: [
                    {
                        name: 'Semaine 1',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 2',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 3',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 4',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 5',
                        initialBalance: 200,
                    },
                ],
            };

            // when / then
            expect(() => factory.create(command)).to.throw(AccountInitialBalanceError);
        });
        it("should throw an error if current balance is 0", function () {
            // given
            const idProvider = {
                get: sinon.stub<any, string>(),
            };
            idProvider.get.returns('uuid');

            const factory = new MonthFactory(idProvider);
            const command = {
                date: new Date(),
                initialBalance: 0,
                outflows: [
                    {
                        label: 'outlfow',
                        amount: 10.05,
                    },
                ],
                weeklyBudgets: [
                    {
                        name: 'Semaine 1',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 2',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 3',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 4',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 5',
                        initialBalance: 200,
                    },
                ],
            };

            // when / then
            expect(() => factory.create(command)).to.throw(AccountInitialBalanceError);
        });
    });
});
