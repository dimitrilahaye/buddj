import expect from "../../../../../test-helpers.js";
import WeeklyExpenseDashboard from "../../../../../../core/models/dashboard/WeeklyExpenseDashboard.js";

describe('Unit | Core | Models | Dashboard | WeeklyExpenseDashboard', () => {
    describe('#constructor', () => {
        it('should return a weekly expense dashboard with right data', () => {
            // given
            const props = {
                amount: 10,
                isChecked: true,
            };

            // when
            const expense = new WeeklyExpenseDashboard(props);

            // then
            expect(expense).to.deep.equal(props);
        });
    });
});
