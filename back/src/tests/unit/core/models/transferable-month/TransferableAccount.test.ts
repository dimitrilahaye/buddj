import expect from "../../../../test-helpers.js";
import TransferableAccount from "../../../../../core/models/transferable-month/TransferableAccount.js";
import TransferableWeeklyBudget from "../../../../../core/models/transferable-month/TransferableWeeklyBudget.js";
import Account from "../../../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../../../core/models/month/account/WeeklyBudget.js";
import TransferableBuilder from "../../../../utils/models/TransferableBuilder.js";

describe("Unit | Core | Models | Transferable Month | TransferableAccount", function () {
  describe("#constructor", function () {
    it("should give an account with right data", function () {
      // given
      const account = new Account({
        id: "id",
        currentBalance: 200,
        outflows: [
          new AccountOutflow({
            id: "id",
            label: "label",
            amount: 20,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "id",
            name: "Semaine 1",
            initialBalance: 200,
            expenses: [],
          }),
          new WeeklyBudget({
            id: "id",
            name: "Semaine 2",
            initialBalance: 200,
            expenses: [],
          }),
          new WeeklyBudget({
            id: "id",
            name: "Semaine 3",
            initialBalance: 200,
            expenses: [],
          }),
          new WeeklyBudget({
            id: "id",
            name: "Semaine 4",
            initialBalance: 200,
            expenses: [],
          }),
          new WeeklyBudget({
            id: "id",
            name: "Semaine 5",
            initialBalance: 200,
            expenses: [],
          }),
        ],
      });

      // when
      const transferableAccount = new TransferableAccount(account);

      // then
      expect(transferableAccount.id).to.be.equal(account.id);
      transferableAccount.weeklyBudgets.forEach((w) => {
        expect(w).to.be.instanceOf(TransferableWeeklyBudget);
      });
    });
  });

  describe("#transferRemainingBalanceTo", function () {
    describe("when account current balance is positive", function () {
      it("should increase the weekly budget current balance", function () {
        // given
        const transferableBuilder = new TransferableBuilder();
        const { accountInstances, weeklyBudgetInstances } =
          transferableBuilder.set
            .account("account-uuid")
            .currentBalance(20)
            .set.weeklyBudget("semaine-1-uuid")
            .initialBalance(200)
            .set.weeklyBudget("semaine-1-uuid")
            .currentBalance(-10)
            .get();

        const { account, transferable: transferableAccount } = accountInstances;
        const { weeklyBudgets, transferables: transferablesWeeklyBudgets } =
          weeklyBudgetInstances;

        const [transferableWeeklyBudget] = transferablesWeeklyBudgets;
        const [weeklyBudget] = weeklyBudgets;

        // when
        transferableAccount.transferRemainingBalanceTo(
          transferableWeeklyBudget
        );

        // then
        expect(account.currentBalance).to.be.equal(0);
        expect(weeklyBudget.initialBalance).to.be.equal(220);
        expect(weeklyBudget.currentBalance).to.be.equal(10);
      });
    });

    describe("when account current balance is negative", function () {
      it("should decrease the weekly budget current balance", function () {
        // given
        const transferableBuilder = new TransferableBuilder();
        const { accountInstances, weeklyBudgetInstances } =
          transferableBuilder.set
            .account("account-uuid")
            .currentBalance(-10)
            .set.weeklyBudget("semaine-1-uuid")
            .initialBalance(200)
            .set.weeklyBudget("semaine-1-uuid")
            .currentBalance(110)
            .get();

        const { account, transferable: transferableAccount } = accountInstances;
        const { weeklyBudgets, transferables: transferablesWeeklyBudgets } =
          weeklyBudgetInstances;

        const [transferableWeeklyBudget] = transferablesWeeklyBudgets;
        const [weeklyBudget] = weeklyBudgets;

        // when
        transferableAccount.transferRemainingBalanceTo(
          transferableWeeklyBudget
        );

        // then
        expect(account.currentBalance).to.be.equal(0);
        expect(weeklyBudget.initialBalance).to.be.equal(190);
        expect(weeklyBudget.currentBalance).to.be.equal(100);
      });
    });
  });
});
