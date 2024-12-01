import expect from "../../../../test-helpers.js";
import MonthlyOutflowTemplate from "../../../../../core/models/template/MonthlyOutflowTemplate.js";

describe("Unit | Core | Models | Template | MonthlyOutflowTemplate", function () {
  describe("#constructor", function () {
    it("should give an outflow template with right data", function () {
      // given
      const props = {
        id: "id",
        label: "outlfow",
        amount: 10.05,
      };

      // when
      const outflow = new MonthlyOutflowTemplate(props);

      // then
      expect(outflow).to.deep.equal(props);
    });
  });
});
