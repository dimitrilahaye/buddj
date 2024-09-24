import expect from "../../../../test-helpers.js";
import WeeklyBudgetTemplate from "../../../../../core/models/template/WeeklyBudgetTemplate.js";

describe("Unit | Core | Models | Template | WeeklyBudgetTemplate", function () {
    describe("#constructor", function () {
        it("should give a weekly budget template with right data", function () {
            // given
            const props = {
                name: 'Semaine 1',
            };

            // when
            const budget = new WeeklyBudgetTemplate(props);

            // then
            expect(budget).to.deep.equal({...props, initialBalance: 200});
        });
    });
});
