import expect from "../../../../test-helpers.js";
import TransferRemainingBalanceBuilder from "../../../../../core/models/transferable-month/builder/TransferRemainingBalanceBuilder.js";
import TransferableMonth from "../../../../../core/models/transferable-month/TransferableMonth.js";
import TransferableAccount from "../../../../../core/models/transferable-month/TransferableAccount.js";
import TransferableWeeklyBudget from "../../../../../core/models/transferable-month/TransferableWeeklyBudget.js";
import {
  TransferableAccountNotFoundError,
  TransferableWeeklyBudgetNotFoundError,
} from "../../../../../core/errors/TransferableMonthErrors.js";
import AccountOutflow from "../../../../../core/models/month/account/AccountOutflow.js";
import MonthBuilder from "../../../../utils/models/MonthBuilder.js";
import WeeklyExpense from "../../../../../core/models/month/account/WeeklyExpense.js";
import TransferableMonthBuilder from "../../../../utils/models/TransferableMonthBuilder.js";

describe("Unit | Core | Models | Transferable Month | TransferableMonth", function () {
  describe("#constructor", function () {
    it("should give a month with right data", function () {
      // given
      const transferableMonth = getTransferableMonth();

      // then
      expect(transferableMonth.transferRemainingBalance).instanceOf(
        TransferRemainingBalanceBuilder
      );
    });
  });

  describe("#findAccountById", function () {
    it("should return account if exists", function () {
      // given
      const transferableMonth = getTransferableMonth();

      // when
      const transferableAccount =
        transferableMonth.findAccountById("account-uuid");

      // then
      expect(transferableAccount).not.to.be.undefined;
      expect(transferableAccount).instanceOf(TransferableAccount);
    });

    it("should throw an error if account not found", function () {
      // given
      const transferableMonth = getTransferableMonth();

      // then
      expect(() =>
        transferableMonth.findAccountById("not existed id")
      ).to.throw(TransferableAccountNotFoundError);
    });
  });

  describe("#findWeeklyBudgetById", function () {
    it("should return weekly budget if exists", function () {
      // given
      const transferableMonth = getTransferableMonth();

      // when
      const transferableWeeklyBudget =
        transferableMonth.findWeeklyBudgetById("semaine-1-uuid");

      // then
      expect(transferableWeeklyBudget).not.to.be.undefined;
      expect(transferableWeeklyBudget).instanceOf(TransferableWeeklyBudget);
    });

    it("should throw an error if weekly budget not found", function () {
      // given
      const transferableMonth = getTransferableMonth();

      // then
      expect(() =>
        transferableMonth.findWeeklyBudgetById("not existed id")
      ).to.throw(TransferableWeeklyBudgetNotFoundError);
    });
  });

  describe("#transferRemainingBalance", function () {
    describe("from account to weekly budget", function () {
      it("should perform transfer", function () {
        // given
        const transferableMonthBuilder = new TransferableMonthBuilder();
        const transferableMonth = transferableMonthBuilder.set.account
          .currentBalance(20)

          .set.weeklyBudget("Semaine 1")
          .initialBalance(200)

          .set.weeklyBudget("Semaine 1")
          .currentBalance(-10)
          .get();

        // when
        transferableMonth.transferRemainingBalance
          .from()
          .account("account-uuid")
          .to<TransferableWeeklyBudget>()
          .weeklyBudget("semaine-1-uuid");

        // then
        const account = transferableMonth.findAccountById("account-uuid");
        const weeklyBudget =
          transferableMonth.findWeeklyBudgetById("semaine-1-uuid");

        expect(account.account.currentBalance).to.be.equal(0);
        expect(weeklyBudget.weeklyBudget.initialBalance).to.be.equal(220);
        expect(weeklyBudget.weeklyBudget.currentBalance).to.be.equal(10);
      });
    });

    describe("from weekly budget to account", function () {
      it("should perform transfer", function () {
        // given
        const transferableMonthBuilder = new TransferableMonthBuilder();
        const transferableMonth = transferableMonthBuilder.set.account
          .currentBalance(-10)

          .set.weeklyBudget("Semaine 1")
          .initialBalance(200)

          .set.weeklyBudget("Semaine 1")
          .currentBalance(20)
          .get();

        // when
        transferableMonth.transferRemainingBalance
          .from()
          .weeklyBudget("semaine-1-uuid")
          .to<TransferableAccount>()
          .account("account-uuid");

        // then
        const account = transferableMonth.findAccountById("account-uuid");
        const weeklyBudget =
          transferableMonth.findWeeklyBudgetById("semaine-1-uuid");

        expect(account.account.currentBalance).to.be.equal(10);
        expect(weeklyBudget.weeklyBudget.initialBalance).to.be.equal(180);
        expect(weeklyBudget.weeklyBudget.currentBalance).to.be.equal(0);
      });
    });

    describe("from weekly budget to weekly budget", function () {
      it("should perform transfer", function () {
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
          .get();

        // when
        transferableMonth.transferRemainingBalance
          .from()
          .weeklyBudget("semaine-1-uuid")
          .to<TransferableWeeklyBudget>()
          .weeklyBudget("semaine-2-uuid");

        // then
        const fromWeeklyBudget =
          transferableMonth.findWeeklyBudgetById("semaine-1-uuid");
        const toWeeklyBudget =
          transferableMonth.findWeeklyBudgetById("semaine-2-uuid");

        expect(fromWeeklyBudget.weeklyBudget.initialBalance).to.be.equal(180);
        expect(fromWeeklyBudget.weeklyBudget.currentBalance).to.be.equal(0);

        expect(toWeeklyBudget.weeklyBudget.initialBalance).to.be.equal(220);
        expect(toWeeklyBudget.weeklyBudget.currentBalance).to.be.equal(10);
      });
    });
  });
});

function getTransferableMonth() {
  const monthBuilder = new MonthBuilder();
  const month = monthBuilder.set
    .accountCurrentBalance(10)
    .set.weeklyBudgetInitialBalance(200)
    .toWeek("Semaine 1")
    .add.outflow(
      new AccountOutflow({
        id: "outflow-1-uuid",
        amount: 190,
        label: "my outflow",
      })
    )
    .add.expense(
      new WeeklyExpense({
        id: "expense-1-uuid",
        amount: 90,
        date: new Date(),
        label: "my expense",
      })
    )
    .toWeek("Semaine 1").get;

  return new TransferableMonth(month);
}
