import expect from "../../../test-helpers.js";
import MonthCreationTemplateRepository from "../../../../providers/persistence/repositories/MonthCreationTemplateRepository.js";
import { pendingDebitRepositoryStub } from "./test-helpers.js";
import MonthCreationTemplate from "../../../../core/models/template/MonthCreationTemplate.js";
import GetMonthCreationTemplate from "../../../../core/usecases/GetMonthCreationTemplate.js";

describe("Unit | Core | Usecases | GetMonthCreationTemplate", function () {
  it("should return data for a new month creation", async function () {
    // given
    const usecase = new GetMonthCreationTemplate(
      new MonthCreationTemplateRepository(),
      pendingDebitRepositoryStub
    );
    const expectedDebits = Symbol("debits");
    pendingDebitRepositoryStub.getAll.resolves(expectedDebits);

    // when
    const monthCreationTemplate = await usecase.execute();

    // then
    expect(monthCreationTemplate.template).to.be.instanceof(
      MonthCreationTemplate
    );
    expect(monthCreationTemplate.pendingDebits).to.be.equals(expectedDebits);
  });
});
