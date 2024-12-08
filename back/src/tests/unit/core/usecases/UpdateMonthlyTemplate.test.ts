import expect from "../../../test-helpers.js";
import UpdateMonthlyTemplate from "../../../../core/usecases/UpdateMonthlyTemplate.js";
import { MonthlyTemplateDoesNotExistError } from "../../../../core/errors/MonthlyTemplateErrors.js";
import {
  monthlyBudgetTemplateRepositoryStub,
  monthlyOutflowTemplateRepositoryStub,
  monthlyTemplateRepositoryStub,
} from "./test-helpers.js";
import sinon from "sinon";

describe("Unit | Core | Usecases | UpdateMonthlyTemplate", function () {
  // save
  // return
  it("should return updated template", async () => {});
  describe("when template does not exist", () => {
    it("should throw an error", async () => {
      // given
      const command = { id: "unexisting-id", name: "newName", isDefault: true };
      monthlyTemplateRepositoryStub.getById.resolves(null);
      const usecase = new UpdateMonthlyTemplate(
        monthlyTemplateRepositoryStub,
        monthlyOutflowTemplateRepositoryStub,
        monthlyBudgetTemplateRepositoryStub
      );

      // when / then
      await expect(usecase.execute(command)).to.be.rejectedWith(
        MonthlyTemplateDoesNotExistError
      );
      expect(monthlyTemplateRepositoryStub.getById).has.been.calledWith(
        command.id
      );
    });

    it("should updat the template and return it", async () => {
      // given
      const command = { id: "id", name: "newName", isDefault: true };
      const templateGetByIdSpy = {
        id: command.id,
        updateName: sinon.spy(),
        updateIsDefault: sinon.spy(),
        outflows: [],
        budgets: [],
      };
      monthlyTemplateRepositoryStub.getById.resolves(templateGetByIdSpy);
      const templateSaveSpy = {
        id: command.id,
        outflows: [],
        budgets: [],
      };
      monthlyTemplateRepositoryStub.save.resolves(templateSaveSpy);
      const expectedTemplateOutflows = Symbol("expectedTemplateOutflows");
      monthlyOutflowTemplateRepositoryStub.getAllByTemplateId.resolves(
        expectedTemplateOutflows
      );

      const expectedTemplateBudgets = Symbol("expectedTemplateBudgets");
      monthlyBudgetTemplateRepositoryStub.getAllByTemplateId.resolves(
        expectedTemplateBudgets
      );

      const usecase = new UpdateMonthlyTemplate(
        monthlyTemplateRepositoryStub,
        monthlyOutflowTemplateRepositoryStub,
        monthlyBudgetTemplateRepositoryStub
      );

      // when
      const monthlyTemplate = await usecase.execute(command);

      // then
      expect(monthlyTemplateRepositoryStub.getById).has.been.calledWith(
        command.id
      );

      expect(templateGetByIdSpy.updateName).has.been.calledWith(command.name);
      expect(templateGetByIdSpy.updateIsDefault).has.been.calledWith(
        command.isDefault
      );

      expect(
        monthlyOutflowTemplateRepositoryStub.getAllByTemplateId
      ).to.have.been.calledOnceWith(command.id);
      expect(
        monthlyBudgetTemplateRepositoryStub.getAllByTemplateId
      ).to.have.been.calledOnceWith(command.id);

      expect(monthlyTemplate.budgets).to.be.equals(expectedTemplateBudgets);
      expect(monthlyTemplate.outflows).to.be.equals(expectedTemplateOutflows);
    });
  });
});
