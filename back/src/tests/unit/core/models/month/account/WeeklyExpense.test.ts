import expect from "../../../../../test-helpers.js";
import WeeklyExpense from "../../../../../../core/models/month/account/WeeklyExpense.js";
import {WeeklyExpenseAmountError} from "../../../../../../core/errors/WeeklyExpenseErrors.js";

describe("Unit | Core | Models | Month | Account | WeeklyExpense", function () {
    describe("#constructor", function () {
        it("should give a weekly expense with right data", function () {
            // given
            const props = {
                id: 'uuid',
                label: 'JOW',
                amount: 10.05,
                isChecked: true,
                date: new Date(),
            };

            // when
            const expense = new WeeklyExpense(props);

            // then
            expect(expense).to.deep.equal(props);
        });
        it("should give a weekly expense with data with default isChecked false", function () {
            // given
            const props = {
                id: 'uuid',
                label: 'JOW',
                amount: 10.05,
                date: new Date(),
            };

            // when
            const expense = new WeeklyExpense(props);

            // then
            expect(expense).to.deep.equal({...props, isChecked: false});
        });
        it("should throw an error if amount is negative", function () {
            // given
            const props = {
                id: 'uuid',
                label: 'JOW',
                amount: -10.05,
                date: new Date(),
            };

            // when / then
            expect(() => new WeeklyExpense(props)).to.throw(WeeklyExpenseAmountError);
        });
        it("should throw an error if amount is 0", function () {
            // given
            const props = {
                id: 'uuid',
                label: 'JOW',
                amount: 0,
                date: new Date(),
            };

            // when / then
            expect(() => new WeeklyExpense(props)).to.throw(WeeklyExpenseAmountError);
        });
    });

    describe("#check", function () {
        it("should check the expense", function () {
            // given
            const expense = new WeeklyExpense({
                id: 'uuid',
                label: 'JOW',
                amount: 10.05,
                isChecked: false,
                date: new Date(),
            });

            // when
            expense.check();

            // then
            expect(expense.isChecked).is.true;
        });
    });

    describe("#uncheck", function () {
        it("should uncheck the expense", function () {
            // given
            const expense = new WeeklyExpense({
                id: 'uuid',
                label: 'JOW',
                amount: 10.05,
                isChecked: true,
                date: new Date(),
            });

            // when
            expense.uncheck();

            // then
            expect(expense.isChecked).is.false;
        });
    });

    describe("#updateAmount", function () {
        it("should change the amount", function () {
            // given
            const expense = new WeeklyExpense({
                id: 'uuid',
                label: 'JOW',
                amount: 10.05,
                isChecked: true,
                date: new Date(),
            });

            // when
            expense.updateAmount(20);

            // then
            expect(expense.amount).to.be.equal(20);
        });
        it("should throw an error if new amount is not greater than 0", function () {
            // given
            const expense = new WeeklyExpense({
                id: 'uuid',
                label: 'JOW',
                amount: 10.05,
                isChecked: true,
                date: new Date(),
            });

            // when / then
            expect(() => expense.updateAmount(-20)).to.throw(WeeklyExpenseAmountError);
        });
    });

    describe("#updateLabel", function () {
        it("should change the amount", function () {
            // given
            const expense = new WeeklyExpense({
                id: 'uuid',
                label: 'JOW',
                amount: 10.05,
                isChecked: true,
                date: new Date(),
            });

            // when
            expense.updateLabel('JODI');

            // then
            expect(expense.label).to.be.equal('JODI');
        });
    });
});
