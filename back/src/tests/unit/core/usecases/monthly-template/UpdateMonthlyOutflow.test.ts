import sinon from "sinon";
import { afterEach } from "mocha";
import expect from "../../../../test-helpers.js";
import UpdateMonthlyOutflow from "../../../../../core/usecases/monthly-template/UpdateMonthlyOutflow.js";
import UpdateMonthlyBudget from "../../../../../core/usecases/monthly-template/UpdateMonthlyBudget.js";
import { MonthlyTemplateDoesNotExistError } from "../../../../../core/errors/MonthlyTemplateErrors.js";
import {
  monthlyBudgetTemplateRepositoryStub,
  monthlyOutflowTemplateRepositoryStub,
  monthlyTemplateRepositoryStub,
  resetStubs,
} from "../test-helpers.js";

describe("Unit | Core | Usecases | UpdateMonthlyOutflow & UpdateMonthlyBudget", function () {
  afterEach(() => {
    resetStubs();
  });

  function stubTemplate(methods: Record<string, sinon.SinonStub>) {
    const template: any = { id: "template-id", outflows: [], budgets: [], ...methods };
    monthlyTemplateRepositoryStub.getById.resolves(template);
    monthlyOutflowTemplateRepositoryStub.getAllByTemplateId.resolves([]);
    monthlyBudgetTemplateRepositoryStub.getAllByTemplateId.resolves([]);
    return template;
  }

  it("should update a template outflow and persist it", async () => {
    // given
    const updated = Symbol("updated");
    const template = stubTemplate({ updateOutflow: sinon.stub().returns(updated) });
    const usecase = new UpdateMonthlyOutflow(
      monthlyTemplateRepositoryStub,
      monthlyOutflowTemplateRepositoryStub,
      monthlyBudgetTemplateRepositoryStub
    );

    // when
    const result = await usecase.execute({
      templateId: "template-id",
      outflowId: "outflow-id",
      label: "Engie",
      amount: 90,
    });

    // then
    expect(template.updateOutflow).to.have.been.calledOnceWithExactly(
      "outflow-id",
      "Engie",
      90
    );
    expect(
      monthlyOutflowTemplateRepositoryStub.save
    ).to.have.been.calledOnceWithExactly("template-id", updated);
    expect(result).to.equal(template);
  });

  it("should update a template budget and persist it", async () => {
    // given
    const updated = Symbol("updated");
    const template = stubTemplate({ updateBudget: sinon.stub().returns(updated) });
    const usecase = new UpdateMonthlyBudget(
      monthlyTemplateRepositoryStub,
      monthlyOutflowTemplateRepositoryStub,
      monthlyBudgetTemplateRepositoryStub
    );

    // when
    const result = await usecase.execute({
      templateId: "template-id",
      budgetId: "budget-id",
      name: "Courses",
      initialBalance: 250,
    });

    // then
    expect(template.updateBudget).to.have.been.calledOnceWithExactly(
      "budget-id",
      "Courses",
      250
    );
    expect(
      monthlyBudgetTemplateRepositoryStub.save
    ).to.have.been.calledOnceWithExactly("template-id", updated);
    expect(result).to.equal(template);
  });

  it("should throw if the template does not exist", async () => {
    // given
    monthlyTemplateRepositoryStub.getById.resolves(null);
    const usecase = new UpdateMonthlyOutflow(
      monthlyTemplateRepositoryStub,
      monthlyOutflowTemplateRepositoryStub,
      monthlyBudgetTemplateRepositoryStub
    );

    // when / then
    await expect(
      usecase.execute({
        templateId: "unknown",
        outflowId: "outflow-id",
        label: "Engie",
        amount: 90,
      })
    ).to.be.rejectedWith(MonthlyTemplateDoesNotExistError);
    expect(monthlyOutflowTemplateRepositoryStub.save).to.not.have.been.called;
  });
});
