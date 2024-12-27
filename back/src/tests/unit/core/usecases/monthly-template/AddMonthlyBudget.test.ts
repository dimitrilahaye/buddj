import expect from "../../../../test-helpers.js";
import AddMonthlyBudget from "../../../../../core/usecases/monthly-template/AddMonthlyBudget.js";
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

describe("Unit | Core | Usecases | AddMonthlyBudget", function () {
  afterEach(() => {
    resetStubs();
  });

  describe("when template does not exist", () => {
    it("should throw an error", async () => {
      // given
      const command = {
        templateId: "unexisting-id",
        initialBalance: 200,
        name: "name",
      };
      const newBudget = Symbol("newBudget");
      const factory = {
        create: sinon.stub(),
        idProvider: idProviderStub,
      };
      factory.create.returns(newBudget);
      monthlyTemplateRepositoryStub.getById.resolves(null);
      const usecase = new AddMonthlyBudget(
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
    const command = { templateId: "id", initialBalance: 200, name: "name" };
    const newBudget = Symbol("newBudget");
    const factory = {
      create: sinon.stub(),
      idProvider: idProviderStub,
    };
    factory.create.returns(newBudget);
    const templateGetByIdSpy = {
      id: command.templateId,
      addBudget: sinon.spy(),
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

    const usecase = new AddMonthlyBudget(
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
    expect(templateGetByIdSpy.addBudget).has.been.calledWith(newBudget);

    expect(
      monthlyOutflowTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledOnceWith(command.templateId);
    expect(
      monthlyBudgetTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledOnceWith(command.templateId);
    expect(
      monthlyBudgetTemplateRepositoryStub.save
    ).to.have.been.calledOnceWith(command.templateId, newBudget);

    expect(monthlyTemplate.budgets).to.be.equals(expectedTemplateBudgets);
    expect(monthlyTemplate.outflows).to.be.equals(expectedTemplateOutflows);
  });
});
