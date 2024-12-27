import expect from "../../../../test-helpers.js";
import AddMonthlyOutflow from "../../../../../core/usecases/monthly-template/AddMonthlyOutflow.js";
import { MonthlyTemplateDoesNotExistError } from "../../../../../core/errors/MonthlyTemplateErrors.js";
import {
  idProviderStub,
  monthlyBudgetTemplateRepositoryStub,
  monthlyOutflowTemplateRepositoryStub,
  monthlyTemplateRepositoryStub,
  resetStubs,
} from "../test-helpers.js";
import sinon from "sinon";
import { afterEach } from "mocha";

describe("Unit | Core | Usecases | AddMonthlyOutflow", function () {
  afterEach(() => {
    resetStubs();
  });

  describe("when template does not exist", () => {
    it("should throw an error", async () => {
      // given
      const command = {
        templateId: "unexisting-id",
        amount: 200,
        label: "label",
      };
      const newOutflow = Symbol("newOutflow");
      const factory = {
        create: sinon.stub(),
        idProvider: idProviderStub,
      };
      factory.create.returns(newOutflow);
      monthlyTemplateRepositoryStub.getById.resolves(null);
      const usecase = new AddMonthlyOutflow(
        monthlyTemplateRepositoryStub,
        monthlyOutflowTemplateRepositoryStub,
        monthlyBudgetTemplateRepositoryStub,
        factory
      );

      // when / then
      await expect(usecase.execute(command)).to.be.rejectedWith(
        MonthlyTemplateDoesNotExistError
      );
      expect(monthlyTemplateRepositoryStub.getById).has.been.calledWith(
        command.templateId
      );
    });
  });

  it("should update the template and return it", async () => {
    // given
    const command = { templateId: "id", amount: 200, label: "label" };
    const newOutflow = Symbol("newOutflow");
    const factory = {
      create: sinon.stub(),
      idProvider: idProviderStub,
    };
    factory.create.returns(newOutflow);
    const templateGetByIdSpy = {
      id: command.templateId,
      addOutflow: sinon.spy(),
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

    const usecase = new AddMonthlyOutflow(
      monthlyTemplateRepositoryStub,
      monthlyOutflowTemplateRepositoryStub,
      monthlyBudgetTemplateRepositoryStub,
      factory
    );

    // when
    const monthlyTemplate = await usecase.execute(command);

    // then
    expect(monthlyTemplateRepositoryStub.getById).has.been.calledWith(
      command.templateId
    );

    expect(factory.create).has.been.calledWith(command);
    expect(templateGetByIdSpy.addOutflow).has.been.calledWith(newOutflow);

    expect(
      monthlyOutflowTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledOnceWith(command.templateId);
    expect(
      monthlyBudgetTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledOnceWith(command.templateId);
    expect(
      monthlyOutflowTemplateRepositoryStub.save
    ).to.have.been.calledOnceWith(command.templateId, newOutflow);

    expect(monthlyTemplate.budgets).to.be.equals(expectedTemplateBudgets);
    expect(monthlyTemplate.outflows).to.be.equals(expectedTemplateOutflows);
  });
});
