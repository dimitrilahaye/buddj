import sinon from "sinon";
import expect from "../../../test-helpers.js";
import AccountBudgetFactory from "../../../../core/factories/AccountBudgetFactory.js";
import WeeklyBudget from "../../../../core/models/month/account/WeeklyBudget.js";

describe("Unit | Core | Factories | AccountBudgetFactory", function () {
  describe("#create", function () {
    it("should give a budget with right data", function () {
      // given
      const idProvider = {
        get: sinon.stub<any, string>(),
      };
      idProvider.get.returns("uuid");

      const factory = new AccountBudgetFactory(idProvider);
      const command = {
        name: "Vacances",
        initialBalance: 100,
      };

      // when
      const budget = factory.create(command);

      // then
      expect(budget).to.be.instanceof(WeeklyBudget);
      expect(budget).to.deep.equal({
        id: "uuid",
        ...command,
        currentBalance: 100,
        pendingFrom: null,
        expenses: [],
        startAt: null,
        endAt: null,
      });
    });
  });
});
