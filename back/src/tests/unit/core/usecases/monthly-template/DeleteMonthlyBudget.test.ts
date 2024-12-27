import expect from "../../../../test-helpers.js";
import DeleteMonthlyBudget from "../../../../../core/usecases/monthly-template/DeleteMonthlyBudget.js";
import { MonthlyTemplateDoesNotExistError } from "../../../../../core/errors/MonthlyTemplateErrors.js";
import {
  monthlyBudgetTemplateRepositoryStub,
  monthlyOutflowTemplateRepositoryStub,
  monthlyTemplateRepositoryStub,
  resetStubs,
} from "../test-helpers.js";
import sinon from "sinon";
import { afterEach } from "mocha";

describe("Unit | Core | Usecases | DeleteMonthlyBudget", function () {
  afterEach(() => {
    resetStubs();
  });

  it("should return updated template", async () => {});
  describe("when template does not exist", () => {
    it("should throw an error", async () => {
      // given
      const command = { templateId: "unexisting-id", budgetId: "id" };
      monthlyTemplateRepositoryStub.getById.resolves(null);
      const usecase = new DeleteMonthlyBudget(
        monthlyTemplateRepositoryStub,
        monthlyOutflowTemplateRepositoryStub,
        monthlyBudgetTemplateRepositoryStub
      );

      // when / then
      await expect(usecase.execute(command)).to.be.rejectedWith(
        MonthlyTemplateDoesNotExistError
      );
      expect(monthlyTemplateRepositoryStub.getById).has.been.calledWith(
        command.templateId
      );
    });

    it("should update the template and return it", async () => {
      // given
      const command = { templateId: "id", budgetId: "id" };
      const templateGetByIdSpy = {
        id: command.templateId,
        removeBudget: sinon.spy(),
        outflows: [],
        budgets: [],
      };
      monthlyTemplateRepositoryStub.getById.resolves(templateGetByIdSpy);
      const expectedTemplateOutflows = Symbol("expectedTemplateOutflows");
      monthlyOutflowTemplateRepositoryStub.getAllByTemplateId.resolves(
        expectedTemplateOutflows
      );

      const expectedTemplateBudgets = Symbol("expectedTemplateBudgets");
      monthlyBudgetTemplateRepositoryStub.getAllByTemplateId.resolves(
        expectedTemplateBudgets
      );

      const usecase = new DeleteMonthlyBudget(
        monthlyTemplateRepositoryStub,
        monthlyOutflowTemplateRepositoryStub,
        monthlyBudgetTemplateRepositoryStub
      );

      // when
      const monthlyTemplate = await usecase.execute(command);

      // then
      expect(monthlyTemplateRepositoryStub.getById).has.been.calledWith(
        command.templateId
      );

      expect(templateGetByIdSpy.removeBudget).has.been.calledWith(
        command.budgetId
      );

      expect(
        monthlyOutflowTemplateRepositoryStub.getAllByTemplateId
      ).to.have.been.calledOnceWith(command.templateId);
      expect(
        monthlyBudgetTemplateRepositoryStub.getAllByTemplateId
      ).to.have.been.calledOnceWith(command.templateId);
      expect(
        monthlyBudgetTemplateRepositoryStub.deleteById
      ).to.have.been.calledOnceWith(command.budgetId);

      expect(monthlyTemplate.budgets).to.be.equals(expectedTemplateBudgets);
      expect(monthlyTemplate.outflows).to.be.equals(expectedTemplateOutflows);
    });
  });
});
