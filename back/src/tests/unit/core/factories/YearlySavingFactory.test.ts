import expect from "../../../test-helpers.js";
import { idProviderStub } from "../usecases/test-helpers.js";
import YearlySavingFactory from "../../../../core/factories/YearlySavingFactory.js";
import { AddYearlyOutflowCommand } from "../../../../core/usecases/AddYearlyOutflow.js";
import YearlyOutflow from "../../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyBudget from "../../../../core/models/yearly-outflows/YearlyBudget.js";

describe("Unit | Core | Factories | YearlySavingFactory", function () {
  describe("for 'outflow' type", () => {
    it("should return an instance of YearlyOutflow", () => {
      // given
      idProviderStub.get.returns("id");
      const factory = new YearlySavingFactory(idProviderStub);
      const command: AddYearlyOutflowCommand = {
        amount: 10,
        label: "label",
        month: 1,
        type: "outflow",
      };

      // when
      const outflow = factory.create(command);

      // then
      expect(outflow).to.be.instanceOf(YearlyOutflow);
      expect(idProviderStub.get).to.have.been.called;
    });
  });

  describe("for 'budget' type", () => {
    it("should return an instance of YearlyBudget", () => {
      // given
      idProviderStub.get.returns("id");
      const factory = new YearlySavingFactory(idProviderStub);
      const command: AddYearlyOutflowCommand = {
        amount: 10,
        label: "label",
        month: 1,
        type: "budget",
      };

      // when
      const budget = factory.create(command);

      // then
      expect(budget).to.be.instanceOf(YearlyBudget);
      expect(idProviderStub.get).to.have.been.called;
    });
  });
});
