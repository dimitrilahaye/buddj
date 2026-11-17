import expect from "../../../../test-helpers.js";
import MonthlyTemplate from "../../../../../core/models/monthly-template/MonthlyTemplate.js";
import MonthlyBudgetTemplate from "../../../../../core/models/monthly-template/MonthlyBudgetTemplate.js";
import MonthlyOutflowTemplate from "../../../../../core/models/monthly-template/MonthlyOutflowTemplate.js";
import {
  MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError,
  MonthlyBudgetTemplateNotFoundError,
  MonthlyOutflowTemplateLabelCanNotBeEmptyError,
  MonthlyOutflowTemplateNotFoundError,
} from "../../../../../core/errors/MonthlyTemplateErrors.js";

describe("Unit | Core | Models | Template | MonthlyTemplate updates", function () {
  function template() {
    return new MonthlyTemplate({
      id: "template-id",
      name: "Template",
      isDefault: true,
      outflows: [
        new MonthlyOutflowTemplate({ id: "outflow-id", label: "EDF", amount: 100 }),
      ],
      budgets: [
        new MonthlyBudgetTemplate({
          id: "budget-id",
          name: "Courses",
          initialBalance: 200,
        }),
      ],
    });
  }

  describe("#updateOutflow", function () {
    it("should replace label and amount and return the updated outflow", function () {
      const t = template();

      const updated = t.updateOutflow("outflow-id", "Engie", 90);

      expect(updated).to.deep.equal(
        new MonthlyOutflowTemplate({ id: "outflow-id", label: "Engie", amount: 90 })
      );
      expect(t.outflows).to.deep.equal([updated]);
    });

    it("should validate the new values", function () {
      expect(() => template().updateOutflow("outflow-id", "", 90)).to.throw(
        MonthlyOutflowTemplateLabelCanNotBeEmptyError
      );
    });

    it("should throw if the outflow does not exist", function () {
      expect(() => template().updateOutflow("unknown", "Engie", 90)).to.throw(
        MonthlyOutflowTemplateNotFoundError
      );
    });
  });

  describe("#updateBudget", function () {
    it("should replace name and initial balance and return the updated budget", function () {
      const t = template();

      const updated = t.updateBudget("budget-id", "Courses bio", 250);

      expect(updated).to.deep.equal(
        new MonthlyBudgetTemplate({
          id: "budget-id",
          name: "Courses bio",
          initialBalance: 250,
        })
      );
      expect(t.budgets).to.deep.equal([updated]);
    });

    it("should validate the new values", function () {
      expect(() => template().updateBudget("budget-id", "Courses", 0)).to.throw(
        MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError
      );
    });

    it("should throw if the budget does not exist", function () {
      expect(() => template().updateBudget("unknown", "Courses", 10)).to.throw(
        MonthlyBudgetTemplateNotFoundError
      );
    });
  });
});
