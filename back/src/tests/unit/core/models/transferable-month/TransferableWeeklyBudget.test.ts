import expect from "../../../../test-helpers.js";
import TransferableWeeklyBudget from "../../../../../core/models/transferable-month/TransferableWeeklyBudget.js";
import WeeklyBudget from "../../../../../core/models/month/account/WeeklyBudget.js";
import TransferableBuilder from "../../../../utils/models/TransferableBuilder.js";

describe("Unit | Core | Models | Transferable Month | TransferableWeeklyBudget", function () {
  describe("#constructor", function () {
    it("should give a weekly budget with right data", function () {
      // given
      const weeklyBudget = new WeeklyBudget({
        id: "id",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [],
      });

      // when
      const transferableWeeklyBudget = new TransferableWeeklyBudget(
        weeklyBudget
      );

      // then
      expect(transferableWeeklyBudget.id).to.be.equal(weeklyBudget.id);
    });
  });

  describe("#transferRemainingBalanceTo", function () {
    describe("an account", function () {
      describe("when weekly budget current balance is positive", function () {
        it("should increase the account current balance", function () {
          // given
          const transferableBuilder = new TransferableBuilder();
          const { accountInstances, weeklyBudgetInstances } =
            transferableBuilder.set
              .account("account-uuid")
              .currentBalance(20)
              .set.weeklyBudget("semaine-1-uuid")
              .initialBalance(200)
              .set.weeklyBudget("semaine-1-uuid")
              .currentBalance(10)
              .get();

          const { account, transferable: transferableAccount } =
            accountInstances;
          const { weeklyBudgets, transferables: transferablesWeeklyBudgets } =
            weeklyBudgetInstances;

          const [transferableWeeklyBudget] = transferablesWeeklyBudgets;
          const [weeklyBudget] = weeklyBudgets;

          // when
          transferableWeeklyBudget.transferRemainingBalanceTo(
            transferableAccount
          );

          // then
          expect(account.currentBalance).to.be.equal(30);
          expect(weeklyBudget.initialBalance).to.be.equal(190);
          expect(weeklyBudget.currentBalance).to.be.equal(0);
        });
      });

      describe("when weekly budget current balance is negative", function () {
        it("should decrease the account current balance", function () {
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

          const { account, transferable: transferableAccount } =
            accountInstances;
          const { weeklyBudgets, transferables: transferablesWeeklyBudgets } =
            weeklyBudgetInstances;

          const [transferableWeeklyBudget] = transferablesWeeklyBudgets;
          const [weeklyBudget] = weeklyBudgets;

          // when
          transferableWeeklyBudget.transferRemainingBalanceTo(
            transferableAccount
          );

          // then
          expect(account.currentBalance).to.be.equal(10);
          expect(weeklyBudget.initialBalance).to.be.equal(210);
          expect(weeklyBudget.currentBalance).to.be.equal(0);
        });
      });
    });

    describe("another weekly budget", function () {
      describe("when from weekly budget current balance is positive", function () {
        it("should increase to weekly budget current balance", function () {
          // given
          const transferableBuilder = new TransferableBuilder();
          const { weeklyBudgetInstances } = transferableBuilder.set
            .weeklyBudget("semaine-1-uuid")
            .initialBalance(200)
            .set.weeklyBudget("semaine-1-uuid")
            .currentBalance(10)
            .set.weeklyBudget("semaine-2-uuid")
            .initialBalance(200)
            .set.weeklyBudget("semaine-2-uuid")
            .currentBalance(180)
            .get();

          const { weeklyBudgets, transferables: transferablesWeeklyBudgets } =
            weeklyBudgetInstances;

          const [fromTransferableWeeklyBudget, toTransferableWeeklyBudget] =
            transferablesWeeklyBudgets;
          const [fromWeeklyBudget, toWeeklyBudget] = weeklyBudgets;

          // when
          fromTransferableWeeklyBudget.transferRemainingBalanceTo(
            toTransferableWeeklyBudget
          );

          // then
          expect(fromWeeklyBudget.initialBalance).to.be.equal(190);
          expect(fromWeeklyBudget.currentBalance).to.be.equal(0);

          expect(toWeeklyBudget.initialBalance).to.be.equal(210);
          expect(toWeeklyBudget.currentBalance).to.be.equal(190);
        });
      });

      describe("when from weekly budget current balance is negative", function () {
        it("should decrease to weekly budget current balance", function () {
          // given
          const transferableBuilder = new TransferableBuilder();
          const { weeklyBudgetInstances } = transferableBuilder.set
            .weeklyBudget("semaine-1-uuid")
            .initialBalance(200)
            .set.weeklyBudget("semaine-1-uuid")
            .currentBalance(-10)
            .set.weeklyBudget("semaine-2-uuid")
            .initialBalance(200)
            .set.weeklyBudget("semaine-2-uuid")
            .currentBalance(180)
            .get();

          const { weeklyBudgets, transferables: transferablesWeeklyBudgets } =
            weeklyBudgetInstances;

          const [fromTransferableWeeklyBudget, toTransferableWeeklyBudget] =
            transferablesWeeklyBudgets;
          const [fromWeeklyBudget, toWeeklyBudget] = weeklyBudgets;

          // when
          fromTransferableWeeklyBudget.transferRemainingBalanceTo(
            toTransferableWeeklyBudget
          );

          // then
          expect(fromWeeklyBudget.initialBalance).to.be.equal(210);
          expect(fromWeeklyBudget.currentBalance).to.be.equal(0);

          expect(toWeeklyBudget.initialBalance).to.be.equal(190);
          expect(toWeeklyBudget.currentBalance).to.be.equal(170);
        });
      });
    });
  });
});
