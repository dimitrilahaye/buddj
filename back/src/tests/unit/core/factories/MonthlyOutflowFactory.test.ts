import expect from "../../../test-helpers.js";
import { idProviderStub } from "../usecases/test-helpers.js";
import MonthlyOutflowTemplateFactory from "../../../../core/factories/MonthlyOutflowFactory.js";
import MonthlyOutflowTemplate from "../../../../core/models/monthly-template/MonthlyOutflowTemplate.js";

describe("Unit | Core | Factories | MonthlyOutflowFactory", function () {
  it("should return an instance of MonthlyOutflowTemplate", () => {
    // given
    idProviderStub.get.returns("id");
    const factory = new MonthlyOutflowTemplateFactory(idProviderStub);
    const command = { amount: 10, label: "label" };

    // when
    const outflow = factory.create(command);

    // then
    expect(outflow).to.be.instanceOf(MonthlyOutflowTemplate);
    expect(idProviderStub.get).to.have.been.called;
  });
});
