import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/transferBalanceIntoMonth.js";

describe("Unit | Consumers | deserializers | transferBalanceIntoMonth", function () {
  describe("from weekly budget to account", function () {
    const params = {
      monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
      fromType: "weekly-budget",
      fromId: "17e97071-f5e5-466f-9168-93f0ac0822e0",
      toType: "account",
      toId: "00164dfd-3e06-4b86-bb86-d0dbcc9a5431",
    };
    const body = {
      amount: 20,
    };

    it("should return a right command", async function () {
      // when
      const command = deserializer(body, params);

      // then
      expect(command).to.deep.equal({
        monthId: params.monthId,
        amount: body.amount,
        fromWeeklyBudgetId: params.fromId,
        toAccountId: params.toId,
      });
    });
  });

  describe("from weekly budget to weekly budget", function () {
    const params = {
      monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
      fromType: "weekly-budget",
      fromId: "671b07c2-4540-430a-a937-7657bdca8dee",
      toType: "weekly-budget",
      toId: "d34e0864-1a1f-462e-a872-8c33383fb046",
    };
    const body = {
      amount: 20,
    };

    it("should return a right command", async function () {
      // when
      const command = deserializer(body, params);

      // then
      expect(command).to.deep.equal({
        monthId: params.monthId,
        amount: body.amount,
        fromWeeklyBudgetId: params.fromId,
        toWeeklyBudgetId: params.toId,
      });
    });
  });

  describe("from account to weekly budget", function () {
    const params = {
      monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
      fromType: "account",
      fromId: "fc3cb357-1166-4846-a284-aafce1107d43",
      toType: "weekly-budget",
      toId: "0c385270-2ae2-42c4-b9e7-4516f9300fe5",
    };
    const body = {
      amount: 20,
    };

    it("should return a right command", async function () {
      // when
      const command = deserializer(body, params);

      // then
      expect(command).to.deep.equal({
        monthId: params.monthId,
        amount: body.amount,
        fromAccountId: params.fromId,
        toWeeklyBudgetId: params.toId,
      });
    });
  });
});
