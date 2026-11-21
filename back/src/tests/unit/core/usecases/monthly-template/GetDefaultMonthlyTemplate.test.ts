import expect from "../../../../test-helpers.js";
import {
  monthlyTemplateRepositoryStub,
  pendingDebitRepositoryStub,
  resetStubs,
  monthlyOutflowTemplateRepositoryStub,
  monthlyBudgetTemplateRepositoryStub,
} from "../test-helpers.js";
import GetDefaultMonthlyTemplate from "../../../../../core/usecases/monthly-template/GetDefaultMonthlyTemplate.js";

describe("Unit | Core | Usecases | GetDefaultMonthlyTemplate", function () {
  afterEach(() => {
    resetStubs();
  });

  it("should return data for a new month creation", async function () {
    // given
    const expectedDebits = Symbol("debits");
    pendingDebitRepositoryStub.getAll.resolves(expectedDebits);

    const expectedTemplate = {
      id: "id",
      outflows: [],
      budgets: [],
    };
    monthlyTemplateRepositoryStub.getDefault.resolves(expectedTemplate);

    const expectedTemplateOutflows = Symbol("expectedTemplateOutflows");
    monthlyOutflowTemplateRepositoryStub.getAllByTemplateId.resolves(
      expectedTemplateOutflows
    );

    const expectedTemplateBudgets = Symbol("expectedTemplateBudgets");
    monthlyBudgetTemplateRepositoryStub.getAllByTemplateId.resolves(
      expectedTemplateBudgets
    );

    const usecase = new GetDefaultMonthlyTemplate(
      monthlyTemplateRepositoryStub,
      monthlyOutflowTemplateRepositoryStub,
      monthlyBudgetTemplateRepositoryStub,
      pendingDebitRepositoryStub
    );

    // when
    const monthlyTemplate = await usecase.execute();

    // then
    expect(monthlyTemplateRepositoryStub.getDefault).to.have.been.calledOnce;
    expect(
      monthlyOutflowTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledOnceWith(expectedTemplate.id);
    expect(
      monthlyBudgetTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledOnceWith(expectedTemplate.id);
    expect(monthlyTemplateRepositoryStub.getDefault).to.have.been.calledOnce;
    expect(monthlyTemplate.pendingDebits).to.be.equals(expectedDebits);
    expect(monthlyTemplate.template?.budgets).to.be.equals(
      expectedTemplateBudgets
    );
    expect(monthlyTemplate.template?.outflows).to.be.equals(
      expectedTemplateOutflows
    );
  });

  it("should return only null template if there is no default template", async function () {
    // given
    monthlyTemplateRepositoryStub.getDefault.resolves(null);

    const usecase = new GetDefaultMonthlyTemplate(
      monthlyTemplateRepositoryStub,
      monthlyOutflowTemplateRepositoryStub,
      monthlyBudgetTemplateRepositoryStub,
      pendingDebitRepositoryStub
    );

    // when
    const monthlyTemplate = await usecase.execute();

    // then
    expect(monthlyTemplateRepositoryStub.getDefault).to.have.been.calledOnce;
    expect(monthlyTemplate.template).to.be.null;
  });
});
