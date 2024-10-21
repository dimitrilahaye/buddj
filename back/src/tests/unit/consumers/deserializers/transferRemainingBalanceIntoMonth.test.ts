import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/transferRemainingBalanceIntoMonth.js";

describe("Unit | Consumers | deserializers | transferRemainingBalanceIntoMonth", function () {
  describe("from weekly budget to account", function () {
    const params = {
      monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
      fromType: "weekly-budget",
      fromId: "ebf6aae9-5664-4e40-974f-9b373524d031",
      toType: "account",
      toId: "ebf6aae9-5664-4e40-974f-9b373524d031",
    };

    it("should return a right command", async function () {
      // when
      const command = deserializer(params);

      // then
      expect(command).to.deep.equal({
        monthId: params.monthId,
        fromWeeklyBudgetId: params.fromId,
        toAccountId: params.toId,
      });
    });
  });

  describe("from weekly budget to weekly budget", function () {
    const params = {
      monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
      fromType: "weekly-budget",
      fromId: "ebf6aae9-5664-4e40-974f-9b373524d031",
      toType: "weekly-budget",
      toId: "ebf6aae9-5664-4e40-974f-9b373524d031",
    };

    it("should return a right command", async function () {
      // when
      const command = deserializer(params);

      // then
      expect(command).to.deep.equal({
        monthId: params.monthId,
        fromWeeklyBudgetId: params.fromId,
        toWeeklyBudgetId: params.toId,
      });
    });
  });

  describe("from account to weekly budget", function () {
    const params = {
      monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
      fromType: "account",
      fromId: "ebf6aae9-5664-4e40-974f-9b373524d031",
      toType: "weekly-budget",
      toId: "ebf6aae9-5664-4e40-974f-9b373524d031",
    };

    it("should return a right command", async function () {
      // when
      const command = deserializer(params);

      // then
      expect(command).to.deep.equal({
        monthId: params.monthId,
        fromAccountId: params.fromId,
        toWeeklyBudgetId: params.toId,
      });
    });
  });
});
