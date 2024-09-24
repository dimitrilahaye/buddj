import sinon from "sinon";
import expect, {Clock} from "../../../test-helpers.js";
import WeeklyExpense from "../../../../core/models/month/account/WeeklyExpense.js";
import WeeklyExpenseFactory from "../../../../core/factories/WeeklyExpenseFactory.js";

describe("Unit | Core | Factories | WeeklyExpenseFactory", function () {
    describe("#create", function () {
        it("should give a weekly expense with right data", function () {
            // given
            const expenseDate = new Date('2024-01-01');
            let clock = new Clock();
            clock.start(expenseDate);

            const idProvider = {
                get: sinon.stub<any, string>(),
            };
            idProvider.get.returns('uuid');

            const factory = new WeeklyExpenseFactory(idProvider);
            const command = {
                label: 'JOW',
                amount: 10,
            };

            // when
            const expense = factory.create(command);

            // then
            expect(expense).to.be.instanceof(WeeklyExpense);
            expect(expense).to.deep.equal({
                id: 'uuid',
                label: 'JOW',
                amount: 10,
                isChecked: false,
                date: expenseDate,
            });
            clock.restore();
        });
    });
});
