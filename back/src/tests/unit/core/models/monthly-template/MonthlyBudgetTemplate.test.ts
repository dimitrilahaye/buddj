import expect from "../../../../test-helpers.js";
import MonthlyBudgetTemplate from "../../../../../core/models/monthly-template/MonthlyBudgetTemplate.js";
import {
  MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError,
  MonthlyBudgetTemplateNameCanNotBeEmptyError,
} from "../../../../../core/errors/MonthlyTemplateErrors.js";

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

    it("should throw an error if initial balance is less than 1", function () {
      // given
      const props = {
        id: "id",
        name: "Semaine 1",
        initialBalance: 0,
      };

      // when / then
      expect(() => new MonthlyBudgetTemplate(props)).to.throw(
        MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError
      );
    });

    it("should throw an error if name is empty", function () {
      // given
      const props = {
        id: "id",
        name: "",
        initialBalance: 200,
      };

      // when / then
      expect(() => new MonthlyBudgetTemplate(props)).to.throw(
        MonthlyBudgetTemplateNameCanNotBeEmptyError
      );
    });
  });
});
