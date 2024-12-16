import expect from "../../../../test-helpers.js";
import YearlyOutflow from "../../../../../core/models/yearly-outflows/YearlyOutflow.js";

describe("Unit | Core | Models | Yearly outflows | YearlyOutflow", () => {
  describe("#constructor", () => {
    it("should return a yearly outflow with right data", () => {
      // given
      const props = {
        id: "id",
        month: 1,
        label: "label",
        amount: 10,
      };

      // when
      const outflow = new YearlyOutflow(props);

      // then
      expect(outflow.id).to.equal(props.id);
      expect(outflow.month).to.equal(props.month);
      expect(outflow.label).to.equal(props.label);
      expect(outflow.amount).to.equal(props.amount);
      expect(outflow.type).to.equal("outflow");
    });
  });
});
