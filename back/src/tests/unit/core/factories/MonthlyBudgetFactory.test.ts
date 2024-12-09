import expect from "../../../test-helpers.js";
import { idProviderStub } from "../usecases/test-helpers.js";
import MonthlyBudgetTemplateFactory from "../../../../core/factories/MonthlyBudgetFactory.js";
import MonthlyBudgetTemplate from "../../../../core/models/monthly-template/MonthlyBudgetTemplate.js";

describe("Unit | Core | Factories | MonthlyBudgetFactory", function () {
  it("should return an instance of MonthlyBudgetTemplate", () => {
    // given
    idProviderStub.get.returns("id");
    const factory = new MonthlyBudgetTemplateFactory(idProviderStub);
    const command = { initialBalance: 10, name: "label" };

    // when
    const outflow = factory.create(command);

    // then
    expect(outflow).to.be.instanceOf(MonthlyBudgetTemplate);
    expect(idProviderStub.get).to.have.been.called;
  });
});
