import expect from "../../../test-helpers.js";
import {
  monthCreationTemplateRepositoryStub,
  pendingDebitRepositoryStub,
  resetStubs,
  yearlyOutflowRepositoryStub,
} from "./test-helpers.js";
import GetMonthCreationTemplate from "../../../../core/usecases/GetMonthCreationTemplate.js";
import { after } from "mocha";
import sinon from "sinon";

describe("Unit | Core | Usecases | GetMonthCreationTemplate", function () {
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
      addMonthlyProjectForAmount: sinon.stub(),
    };
    monthCreationTemplateRepositoryStub.getNewMonthTemplate.resolves(
      expectedTemplate
    );

    const usecase = new GetMonthCreationTemplate(
      monthCreationTemplateRepositoryStub,
      pendingDebitRepositoryStub,
      yearlyOutflowRepositoryStub
    );

    // when
    const monthCreationTemplate = await usecase.execute();

    // then
    expect(monthCreationTemplateRepositoryStub.getNewMonthTemplate).to.have.been
      .calledOnce;
    expect(
      expectedTemplate.addMonthlyProjectForAmount
    ).to.have.been.calledOnceWith(expectedTotal);
    expect(monthCreationTemplate.pendingDebits).to.be.equals(expectedDebits);
  });
});
