import expect from "../../../test-helpers.js";
import {
  monthlyTemplateRepositoryStub,
  pendingDebitRepositoryStub,
  resetStubs,
  yearlyOutflowRepositoryStub,
  idProviderStub,
  monthlyOutflowTemplateRepositoryStub,
  monthlyBudgetTemplateRepositoryStub,
} from "./test-helpers.js";
import GetDefaultMonthlyTemplate from "../../../../core/usecases/GetDefaultMonthlyTemplate.js";
import { after } from "mocha";
import sinon from "sinon";

describe("Unit | Core | Usecases | GetDefaultMonthlyTemplate", function () {
  after(() => {
    resetStubs();
  });

  it("should return data for a new month creation", async function () {
    // given
    const expectedDebits = Symbol("debits");
    pendingDebitRepositoryStub.getAll.resolves(expectedDebits);

    const expectedTotal = 120;
    const expectedOutflows = {
      getMonthlyProjectsAmount: () => expectedTotal,
    };
    yearlyOutflowRepositoryStub.getAll.resolves(expectedOutflows);

    const expectedTemplate = {
      id: "id",
      outflows: [],
      budgets: [],
      addMonthlyProjectForAmount: sinon.stub(),
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
      pendingDebitRepositoryStub,
      yearlyOutflowRepositoryStub,
      idProviderStub
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
    expect(
      expectedTemplate.addMonthlyProjectForAmount
    ).to.have.been.calledOnceWith(idProviderStub, expectedTotal);
    expect(monthlyTemplate.pendingDebits).to.be.equals(expectedDebits);
    expect(monthlyTemplate.template?.budgets).to.be.equals(
      expectedTemplateBudgets
    );
    expect(monthlyTemplate.template?.outflows).to.be.equals(
      expectedTemplateOutflows
    );
  });
});
