import { beforeEach } from "mocha";
import expect from "../../../test-helpers.js";
import TransferRemainingBalanceIntoMonth from "../../../../core/usecases/TransferRemainingBalanceIntoMonth.js";
import { MonthNotFoundError } from "../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub, resetStubs } from "./test-helpers.js";
import TransferableMonthBuilder from "../../../utils/models/TransferableMonthBuilder.js";
import {
  TransferableAccountNotFoundError,
  TransferableWeeklyBudgetNotFoundError,
} from "../../../../core/errors/TransferableMonthErrors.js";
import { TransferRemainingBalanceIntoMonthError } from "../../../../core/errors/TransferRemainingBalanceIntoMonthErrors.js";

describe("Unit | Core | Usecases | TransferRemainingBalanceIntoMonth", function () {
  let usecase: TransferRemainingBalanceIntoMonth;

  beforeEach(() => {
    usecase = new TransferRemainingBalanceIntoMonth(monthRepositoryStub);
    resetStubs();
  });

  describe("not found", function () {
    describe("when month does not exist", function () {
      it("should throw an error", async function () {
        // given
        monthRepositoryStub.getTransferableById.resolves(null);

        // then
        await expect(
          usecase.execute({
            monthId: "month-id",
            fromAccountId: "account-uuid",
            toWeeklyBudgetId: "semaine-1-uuid",
          })
        ).to.be.rejectedWith(MonthNotFoundError);
        expect(monthRepositoryStub.getTransferableById).calledOnceWithExactly(
          "month-id"
        );
      });
    });
  });

  describe("transfer from account to weekly budget", function () {
    describe("not found", function () {
      describe("when from account does not exist", function () {
        it("should throw an error", async function () {
          // given
          const transferableMonthBuilder = new TransferableMonthBuilder();
          const transferableMonth = transferableMonthBuilder.set.account
            .currentBalance(20)
            .set.weeklyBudget("Semaine 1")
            .initialBalance(200)
            .set.weeklyBudget("Semaine 1")
            .currentBalance(-10)
            .getTransferable();
          monthRepositoryStub.getTransferableById.resolves(transferableMonth);

          // when
          await expect(
            usecase.execute({
              monthId: "month-id",
              fromAccountId: "not-existing-account",
              toWeeklyBudgetId: "semaine-1-uuid",
            })
          ).to.be.rejectedWith(TransferableAccountNotFoundError);
        });
      });
      describe("when to weekly budget does not exist", function () {
        it("should throw an error", async function () {
          // given
          const transferableMonthBuilder = new TransferableMonthBuilder();
          const transferableMonth = transferableMonthBuilder.set.account
            .currentBalance(20)
            .set.weeklyBudget("Semaine 1")
            .initialBalance(200)
            .set.weeklyBudget("Semaine 1")
            .currentBalance(-10)
            .getTransferable();
          monthRepositoryStub.getTransferableById.resolves(transferableMonth);

          // when
          await expect(
            usecase.execute({
              monthId: "month-id",
              fromAccountId: "account-uuid",
              toWeeklyBudgetId: "not-existing-week",
            })
          ).to.be.rejectedWith(TransferableWeeklyBudgetNotFoundError);
        });
      });
    });
    it.only("should return an updated month", async function () {
      // given
      const transferableMonthBuilder = new TransferableMonthBuilder();
      const transferableMonth = transferableMonthBuilder.set.account
        .currentBalance(-20)
        .set.weeklyBudget("Semaine 1")
        .initialBalance(200)
        .set.weeklyBudget("Semaine 1")
        .currentBalance(20)
        .getTransferable();

      monthRepositoryStub.getTransferableById.resolves(transferableMonth);
      monthRepositoryStub.updateAccountCurrentBalance.resolves();
      monthRepositoryStub.updateWeeklyBudgetInitialBalance.resolves();

      // when
      const month = await usecase.execute({
        monthId: "month-id",
        fromAccountId: "account-uuid",
        toWeeklyBudgetId: "semaine-1-uuid",
      });

      // then
      const weeklyBudget = month.account.weeklyBudgets.find(
        (w) => w.id === "semaine-1-uuid"
      );
      if (!weeklyBudget) {
        return expect.fail("WeeklyBudget should be found");
      }
      expect(month.account.currentBalance).to.be.equal(0);
      expect(weeklyBudget.initialBalance).to.be.equal(180);
      expect(weeklyBudget.currentBalance).to.be.equal(0);

      expect(
        monthRepositoryStub.updateAccountCurrentBalance
      ).calledOnceWithExactly(transferableMonth.month);
      expect(
        monthRepositoryStub.updateWeeklyBudgetInitialBalance
      ).calledOnceWithExactly(transferableMonth.month, "semaine-1-uuid");
    });
  });

  describe("transfer from weekly budget to account", function () {
    it("should return an updated month", async function () {
      // given
      const transferableMonthBuilder = new TransferableMonthBuilder();
      const transferableMonth = transferableMonthBuilder.set.account
        .currentBalance(-10)
        .set.weeklyBudget("Semaine 1")
        .initialBalance(200)
        .set.weeklyBudget("Semaine 1")
        .currentBalance(20)
        .getTransferable();

      monthRepositoryStub.getTransferableById.resolves(transferableMonth);
      monthRepositoryStub.updateAccountCurrentBalance.resolves();
      monthRepositoryStub.updateWeeklyBudgetInitialBalance.resolves();

      // when
      const month = await usecase.execute({
        monthId: "month-id",
        fromWeeklyBudgetId: "semaine-1-uuid",
        toAccountId: "account-uuid",
      });

      // then
      const weeklyBudget = month.account.weeklyBudgets.find(
        (w) => w.id === "semaine-1-uuid"
      );
      if (!weeklyBudget) {
        return expect.fail("WeeklyBudget should be found");
      }
      expect(month.account.currentBalance).to.be.equal(10);
      expect(weeklyBudget.initialBalance).to.be.equal(180);
      expect(weeklyBudget.currentBalance).to.be.equal(0);

      expect(
        monthRepositoryStub.updateAccountCurrentBalance
      ).calledOnceWithExactly(transferableMonth.month);
      expect(
        monthRepositoryStub.updateWeeklyBudgetInitialBalance
      ).calledOnceWithExactly(transferableMonth.month, "semaine-1-uuid");
    });
  });

  describe("transfer from weekly budget to weekly budget", function () {
    it("should return an updated month", async function () {
      // given
      const transferableMonthBuilder = new TransferableMonthBuilder();
      const transferableMonth = transferableMonthBuilder.set
        .weeklyBudget("Semaine 1")
        .initialBalance(200)
        .set.weeklyBudget("Semaine 1")
        .currentBalance(20)
        .set.weeklyBudget("Semaine 2")
        .initialBalance(200)
        .set.weeklyBudget("Semaine 2")
        .currentBalance(-10)
        .getTransferable();

      monthRepositoryStub.getTransferableById.resolves(transferableMonth);
      monthRepositoryStub.updateWeeklyBudgetInitialBalance.resolves();

      // when
      const month = await usecase.execute({
        monthId: "month-id",
        fromWeeklyBudgetId: "semaine-1-uuid",
        toWeeklyBudgetId: "semaine-2-uuid",
      });

      // then
      const fromWeeklyBudget = month.account.weeklyBudgets.find(
        (w) => w.id === "semaine-1-uuid"
      );
      if (!fromWeeklyBudget) {
        return expect.fail("From WeeklyBudget should be found");
      }
      const toWeeklyBudget = month.account.weeklyBudgets.find(
        (w) => w.id === "semaine-2-uuid"
      );
      if (!toWeeklyBudget) {
        return expect.fail("To WeeklyBudget should be found");
      }

      expect(fromWeeklyBudget.initialBalance).to.be.equal(180);
      expect(fromWeeklyBudget.currentBalance).to.be.equal(0);
      expect(toWeeklyBudget.initialBalance).to.be.equal(220);
      expect(toWeeklyBudget.currentBalance).to.be.equal(10);

      expect(
        monthRepositoryStub.updateWeeklyBudgetInitialBalance.getCall(0).args
      ).to.deep.equal([transferableMonth.month, "semaine-1-uuid"]);
      expect(
        monthRepositoryStub.updateWeeklyBudgetInitialBalance.getCall(1).args
      ).to.deep.equal([transferableMonth.month, "semaine-2-uuid"]);
    });
  });

  describe("command error", function () {
    describe("when command is invalid", function () {
      it("should throw an error", async function () {
        const transferableMonthBuilder = new TransferableMonthBuilder();
        const transferableMonth = transferableMonthBuilder.set.account
          .currentBalance(20)
          .set.weeklyBudget("Semaine 1")
          .initialBalance(200)
          .set.weeklyBudget("Semaine 1")
          .currentBalance(-10)
          .getTransferable();

        monthRepositoryStub.getTransferableById.resolves(transferableMonth);

        // when / then
        await expect(
          usecase.execute({
            monthId: "month-id",
            fromAccountId: "account-1-uuid",
            toAccountId: "account-2-uuid",
          })
        ).to.be.rejectedWith(TransferRemainingBalanceIntoMonthError);
      });
    });
  });
});
