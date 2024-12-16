import expect from "../../../../test-helpers.js";
import YearlyBudget from "../../../../../core/models/yearly-outflows/YearlyBudget.js";

describe("Unit | Core | Models | Yearly outflows | YearlyBudget", () => {
  describe("#constructor", () => {
    it("should return a yearly budget with right data", () => {
      // given
      const props = {
        id: "id",
        month: 1,
        name: "name",
        initialBalance: 10,
      };

      // when
      const budget = new YearlyBudget(props);

      // then
      expect(budget.id).to.equal(props.id);
      expect(budget.month).to.equal(props.month);
      expect(budget.name).to.equal(props.name);
      expect(budget.initialBalance).to.equal(props.initialBalance);
      expect(budget.type).to.equal("budget");
    });
  });
});
