import expect from "../../../../test-helpers.js";
import MonthlyOutflowTemplate from "../../../../../core/models/monthly-template/MonthlyOutflowTemplate.js";
import {
  MonthlyOutflowTemplateAmountCanNotBeLessThanOneError,
  MonthlyOutflowTemplateLabelCanNotBeEmptyError,
} from "../../../../../core/errors/MonthlyTemplateErrors.js";

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

    it("should throw an error if label is empty", function () {
      // given
      const props = {
        id: "id",
        label: "",
        amount: 10.05,
      };

      // when / then
      expect(() => new MonthlyOutflowTemplate(props)).to.throw(
        MonthlyOutflowTemplateLabelCanNotBeEmptyError
      );
    });

    it("should throw an error if amount is less than 1", function () {
      // given
      const props = {
        id: "id",
        label: "label",
        amount: 0,
      };

      // when / then
      expect(() => new MonthlyOutflowTemplate(props)).to.throw(
        MonthlyOutflowTemplateAmountCanNotBeLessThanOneError
      );
    });
  });
});
