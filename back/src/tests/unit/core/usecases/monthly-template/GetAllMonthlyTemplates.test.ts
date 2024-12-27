import expect from "../../../../test-helpers.js";
import {
  monthlyTemplateRepositoryStub,
  resetStubs,
  monthlyOutflowTemplateRepositoryStub,
  monthlyBudgetTemplateRepositoryStub,
} from "../test-helpers.js";
import GetAllMonthlyTemplates from "../../../../../core/usecases/monthly-template/GetAllMonthlyTemplates.js";
import { after } from "mocha";

describe("Unit | Core | Usecases | GetAllMonthlyTemplates", function () {
  after(() => {
    resetStubs();
  });

  it("should return all the templates", async function () {
    // given
    const firstExpectedTemplate = {
      id: "id1",
      outflows: [],
      budgets: [],
    };
    const secondExpectedTemplate = {
      id: "id2",
      outflows: [],
      budgets: [],
    };
    monthlyTemplateRepositoryStub.getAll.resolves([
      firstExpectedTemplate,
      secondExpectedTemplate,
    ]);

    const expectedFirstTemplateOutflows = Symbol(
      "expectedFirstTemplateOutflows"
    );
    monthlyOutflowTemplateRepositoryStub.getAllByTemplateId
      .withArgs(firstExpectedTemplate.id)
      .resolves([expectedFirstTemplateOutflows]);

    const expectedSecondTemplateOutflows = Symbol(
      "expectedSecondTemplateOutflows"
    );
    monthlyOutflowTemplateRepositoryStub.getAllByTemplateId
      .withArgs(secondExpectedTemplate.id)
      .resolves([expectedSecondTemplateOutflows]);

    const expectedFirstTemplateBudgets = Symbol("expectedFirstTemplateBudgets");
    monthlyBudgetTemplateRepositoryStub.getAllByTemplateId
      .withArgs(firstExpectedTemplate.id)
      .resolves([expectedFirstTemplateBudgets]);

    const expectedSecondTemplateBudgets = Symbol(
      "expectedSecondTemplateBudgets"
    );
    monthlyBudgetTemplateRepositoryStub.getAllByTemplateId
      .withArgs(secondExpectedTemplate.id)
      .resolves([expectedSecondTemplateBudgets]);

    const usecase = new GetAllMonthlyTemplates(
      monthlyTemplateRepositoryStub,
      monthlyOutflowTemplateRepositoryStub,
      monthlyBudgetTemplateRepositoryStub
    );

    // when
    const monthlyTemplates = await usecase.execute();

    // then
    expect(monthlyTemplateRepositoryStub.getAll).to.have.been.calledOnce;

    const firstTemplate = monthlyTemplates.find(
      (t) => t.id === firstExpectedTemplate.id
    );
    if (!firstTemplate) {
      expect.fail(
        "It should have a template with id " + firstExpectedTemplate.id
      );
      return;
    }
    const [firstOutflowTemplate] = firstTemplate.outflows;
    expect(firstOutflowTemplate).to.be.deep.equal(
      expectedFirstTemplateOutflows
    );
    const [firstBudgetTemplate] = firstTemplate.budgets;
    expect(firstBudgetTemplate).to.be.deep.equal(expectedFirstTemplateBudgets);

    const secondTemplate = monthlyTemplates.find(
      (t) => t.id === secondExpectedTemplate.id
    );
    if (!secondTemplate) {
      expect.fail(
        "It should have a template with id " + secondExpectedTemplate.id
      );
      return;
    }
    const [secondOutflowTemplate] = secondTemplate.outflows;
    expect(secondOutflowTemplate).to.be.deep.equal(
      expectedSecondTemplateOutflows
    );
    const [secondBudgetTemplate] = secondTemplate.budgets;
    expect(secondBudgetTemplate).to.be.deep.equal(
      expectedSecondTemplateBudgets
    );

    expect(
      monthlyOutflowTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledWith(firstExpectedTemplate.id);
    expect(
      monthlyOutflowTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledWith(secondExpectedTemplate.id);
    expect(
      monthlyBudgetTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledWith(firstExpectedTemplate.id);
    expect(
      monthlyBudgetTemplateRepositoryStub.getAllByTemplateId
    ).to.have.been.calledWith(secondExpectedTemplate.id);
  });
});
