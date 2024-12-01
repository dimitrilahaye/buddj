import expect from "../../../test-helpers.js";
import {
  monthlyTemplateRepositoryStub,
  pendingDebitRepositoryStub,
  resetStubs,
  yearlyOutflowRepositoryStub,
  idProviderStub,
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
      addMonthlyProjectForAmount: sinon.stub(),
    };
    monthlyTemplateRepositoryStub.getDefaultMonthlyTemplate.resolves(
      expectedTemplate
    );

    const usecase = new GetDefaultMonthlyTemplate(
      monthlyTemplateRepositoryStub,
      pendingDebitRepositoryStub,
      yearlyOutflowRepositoryStub,
      idProviderStub
    );

    // when
    const monthlyTemplate = await usecase.execute();

    // then
    expect(monthlyTemplateRepositoryStub.getDefaultMonthlyTemplate).to.have.been
      .calledOnce;
    expect(
      expectedTemplate.addMonthlyProjectForAmount
    ).to.have.been.calledOnceWith(idProviderStub, expectedTotal);
    expect(monthlyTemplate.pendingDebits).to.be.equals(expectedDebits);
  });
});
