import expect from "../../../../test-helpers.js";
import MonthlyBudgetTemplate from "../../../../../core/models/template/MonthlyBudgetTemplate.js";

describe("Unit | Core | Models | Template | MonthlyBudgetTemplate", function () {
  describe("#constructor", function () {
    it("should give a weekly budget template with right data", function () {
      // given
      const props = {
        id: "id",
        name: "Semaine 1",
        initialBalance: 200,
      };

      // when
      const budget = new MonthlyBudgetTemplate(props);

      // then
      expect(budget).to.deep.equal(props);
    });
  });
});
