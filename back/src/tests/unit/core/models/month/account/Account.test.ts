import expect from "../../../../../test-helpers.js";
import Account from "../../../../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../../../../core/models/month/account/WeeklyBudget.js";
import sinon from "sinon";
import WeeklyExpense from "../../../../../../core/models/month/account/WeeklyExpense.js";
import { WeeklyBudgetNotFoundError } from "../../../../../../core/errors/WeeklyBudgetErrors.js";
import { AccountOutflowNotFoundError } from "../../../../../../core/errors/AccountOuflowErrors.js";

describe("Unit | Core | Models | Month | Account | Account", function () {
  describe("#constructor", function () {
    it("should give an account with right data", function () {
      // given
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10,
            isChecked: true,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 20,
            isChecked: false,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };

      // when
      const account = new Account(props);

      // then
      expect(account).to.deep.equal(props);
    });
  });
  describe("#addExpenseToWeeklyBudget", function () {
    it("should call the right weekly budget to add the new expense", function () {
      // given
      const givenDate = new Date();
      const newExpense = new WeeklyExpense({
        id: "uuid",
        amount: 10,
        label: "JOW",
        isChecked: true,
        date: givenDate,
      });
      const targetedWeeklyBudget = "right-uuid";
      const weeklyBudgetStub = new WeeklyBudget({
        id: targetedWeeklyBudget,
        name: "Semaine 1",
        initialBalance: 200,
      });
      weeklyBudgetStub.addExpense = sinon.stub().withArgs(newExpense);
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
          new AccountOutflow({
            id: targetedWeeklyBudget,
            label: "Semaine 1",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 2",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 3",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 4",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 5",
            amount: 200,
          }),
        ],
        weeklyBudgets: [
          weeklyBudgetStub,
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.addExpenseToWeeklyBudget(targetedWeeklyBudget, newExpense);

      // then
      expect(weeklyBudgetStub.addExpense).to.have.been.calledOnceWith(
        newExpense
      );
    });
    it("should throw an error if weekly budget does not exist", function () {
      // given
      const givenDate = new Date();
      const newExpense = new WeeklyExpense({
        id: "uuid",
        amount: 10,
        label: "JOW",
        isChecked: true,
        date: givenDate,
      });
      const weeklyBudgetStub = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
      });
      weeklyBudgetStub.addExpense = sinon.stub().withArgs(newExpense);
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          weeklyBudgetStub,
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when / then
      expect(() =>
        account.addExpenseToWeeklyBudget("not-existing-budget-id", newExpense)
      ).to.throw(WeeklyBudgetNotFoundError);
    });
  });
  describe("#checkExpense", function () {
    it("should call the right weekly budget to check an expense", function () {
      // given
      const givenDate = new Date();
      const targetedExpenseId = "targeted-expense-uuid";
      const existingExpense = new WeeklyExpense({
        id: targetedExpenseId,
        amount: 10,
        label: "JOW",
        isChecked: false,
        date: givenDate,
      });
      const targetedWeeklyBudgetId = "targeted-weekly-budget-uuid";
      const weeklyBudgetStub = new WeeklyBudget({
        id: targetedWeeklyBudgetId,
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpense],
      });
      weeklyBudgetStub.checkExpense = sinon.stub().withArgs(targetedExpenseId);
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
          new AccountOutflow({
            id: targetedWeeklyBudgetId,
            label: "Semaine 1",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 2",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 3",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 4",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 5",
            amount: 200,
          }),
        ],
        weeklyBudgets: [
          weeklyBudgetStub,
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.checkExpense(targetedWeeklyBudgetId, targetedExpenseId);

      // then
      expect(weeklyBudgetStub.checkExpense).to.have.been.calledOnceWith(
        targetedExpenseId
      );
    });
    it("should throw an error if weekly budget does not exist", function () {
      // given
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
            expenses: [
              new WeeklyExpense({
                id: "weekly-expense-id",
                isChecked: false,
                label: "JOW",
                amount: 10,
                date: new Date(),
              }),
            ],
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when / then
      expect(() =>
        account.checkExpense("not-existing-budget-id", "weekly-expense-id")
      ).to.throw(WeeklyBudgetNotFoundError);
    });
  });
  describe("#uncheckExpense", function () {
    it("should call the right weekly budget to check an expense", function () {
      // given
      const givenDate = new Date();
      const targetedExpenseId = "targeted-expense-uuid";
      const existingExpense = new WeeklyExpense({
        id: targetedExpenseId,
        amount: 10,
        label: "JOW",
        isChecked: true,
        date: givenDate,
      });
      const targetedWeeklyBudgetId = "targeted-weekly-budget-uuid";
      const weeklyBudgetStub = new WeeklyBudget({
        id: targetedWeeklyBudgetId,
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpense],
      });
      weeklyBudgetStub.uncheckExpense = sinon
        .stub()
        .withArgs(targetedExpenseId);
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
          new AccountOutflow({
            id: targetedWeeklyBudgetId,
            label: "Semaine 1",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 2",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 3",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 4",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 5",
            amount: 200,
          }),
        ],
        weeklyBudgets: [
          weeklyBudgetStub,
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.uncheckExpense(targetedWeeklyBudgetId, targetedExpenseId);

      // then
      expect(weeklyBudgetStub.uncheckExpense).to.have.been.calledOnceWith(
        targetedExpenseId
      );
    });
    it("should throw an error if weekly budget does not exist", function () {
      // given
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
            expenses: [
              new WeeklyExpense({
                id: "weekly-expense-id",
                isChecked: true,
                label: "JOW",
                amount: 10,
                date: new Date(),
              }),
            ],
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when / then
      expect(() =>
        account.uncheckExpense("not-existing-budget-id", "weekly-expense-id")
      ).to.throw(WeeklyBudgetNotFoundError);
    });
  });
  describe("#updateCurrentBalance", function () {
    it("should update the account current balance", function () {
      // given
      const account = new Account({
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      });

      // when
      account.updateCurrentBalance(1000);

      // then
      expect(account.currentBalance).to.be.equal(1000);
    });
  });
  describe("#checkOutflow", function () {
    it("should call the right outflow to be check", function () {
      // given
      const targetedOutflowId = "targeted-outflow-uuid";
      const outflowStub = new AccountOutflow({
        id: targetedOutflowId,
        label: "outflow",
        amount: 10.05,
        isChecked: false,
      });
      outflowStub.check = sinon.stub();
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          outflowStub,
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.checkOutflow(targetedOutflowId);

      // then
      expect(outflowStub.check).to.have.been.calledOnce;
    });
    it("should throw an error if outflow does not exist", function () {
      // given
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when / then
      expect(() => account.checkOutflow("not-existing-outflow-id")).to.throw(
        AccountOutflowNotFoundError
      );
    });
  });
  describe("#uncheckOutflow", function () {
    it("should call the right outflow to be check", function () {
      // given
      const targetedOutflowId = "targeted-outflow-uuid";
      const outflowStub = new AccountOutflow({
        id: targetedOutflowId,
        label: "outflow",
        amount: 10.05,
        isChecked: true,
      });
      outflowStub.uncheck = sinon.stub();
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          outflowStub,
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.uncheckOutflow(targetedOutflowId);

      // then
      expect(outflowStub.uncheck).to.have.been.calledOnce;
    });
    it("should throw an error if outflow does not exist", function () {
      // given
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when / then
      expect(() => account.uncheckOutflow("not-existing-outflow-id")).to.throw(
        AccountOutflowNotFoundError
      );
    });
  });
  describe("#deleteExpenseFromWeeklyBudget", function () {
    it("should call the right weekly budget", function () {
      // given
      const expenseIdToDelete = "expense-to-delete";
      const expenseToDelete = new WeeklyExpense({
        id: expenseIdToDelete,
        amount: 10,
        label: "JOW",
        isChecked: true,
        date: new Date(),
      });
      const targetedWeeklyBudgetId = "right-uuid";
      const weeklyBudgetStub = new WeeklyBudget({
        id: targetedWeeklyBudgetId,
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [expenseToDelete],
      });
      weeklyBudgetStub.deleteExpenseById = sinon.stub();
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          weeklyBudgetStub,
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.deleteExpenseFromWeeklyBudget(
        targetedWeeklyBudgetId,
        expenseIdToDelete
      );

      // then
      expect(weeklyBudgetStub.deleteExpenseById).to.have.been.calledOnceWith(
        expenseIdToDelete
      );
    });
    it("should throw an error if weekly budget does not exist", function () {
      // given
      const expenseIdToDelete = "expense-to-delete";
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 2",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 3",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 4",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 5",
            amount: 200,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      expect(() =>
        account.deleteExpenseFromWeeklyBudget(
          "not-existing-budget-id",
          expenseIdToDelete
        )
      ).to.throw(WeeklyBudgetNotFoundError);
    });
  });
  describe("#updateExpenseAmountFromWeeklyBudget", function () {
    it("should call the right weekly budget", function () {
      // given
      const expenseIdToUpdate = "expense-to-delete";
      const expenseToUpdate = new WeeklyExpense({
        id: expenseIdToUpdate,
        amount: 10,
        label: "JOW",
        isChecked: true,
        date: new Date(),
      });
      const targetedWeeklyBudgetId = "right-uuid";
      const weeklyBudgetStub = new WeeklyBudget({
        id: targetedWeeklyBudgetId,
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [expenseToUpdate],
      });
      weeklyBudgetStub.updateExpenseAmount = sinon.stub();
      const relatedOutflowStub = new AccountOutflow({
        id: targetedWeeklyBudgetId,
        label: "Semaine 1",
        amount: 200,
      });
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          weeklyBudgetStub,
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.updateExpenseAmountFromWeeklyBudget(
        targetedWeeklyBudgetId,
        expenseIdToUpdate,
        30
      );

      // then
      expect(weeklyBudgetStub.updateExpenseAmount).to.have.been.calledOnceWith(
        expenseIdToUpdate,
        30
      );
    });
    it("should throw an error if weekly budget does not exist", function () {
      // given
      const expenseIdToUpdate = "expense-to-delete";
      const expenseToUpdate = new WeeklyExpense({
        id: expenseIdToUpdate,
        amount: 10,
        label: "JOW",
        isChecked: true,
        date: new Date(),
      });
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 1",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 2",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 3",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 4",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 5",
            amount: 200,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
            expenses: [expenseToUpdate],
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when / then
      expect(() =>
        account.updateExpenseAmountFromWeeklyBudget(
          "not-existing-weekly-id",
          expenseIdToUpdate,
          30
        )
      ).to.throw(WeeklyBudgetNotFoundError);
    });
  });
  describe("#updateExpenseLabelFromWeeklyBudget", function () {
    it("should call the right weekly budget", function () {
      // given
      const expenseIdToUpdate = "expense-to-delete";
      const expenseToUpdate = new WeeklyExpense({
        id: expenseIdToUpdate,
        amount: 10,
        label: "JOW",
        isChecked: true,
        date: new Date(),
      });
      const targetedWeeklyBudgetId = "right-uuid";
      const weeklyBudgetStub = new WeeklyBudget({
        id: targetedWeeklyBudgetId,
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [expenseToUpdate],
      });
      weeklyBudgetStub.updateExpenseLabel = sinon.stub();
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
          new AccountOutflow({
            id: targetedWeeklyBudgetId,
            label: "Semaine 1",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 2",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 3",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 4",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 5",
            amount: 200,
          }),
        ],
        weeklyBudgets: [
          weeklyBudgetStub,
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.updateExpenseLabelFromWeeklyBudget(
        targetedWeeklyBudgetId,
        expenseIdToUpdate,
        "JODI"
      );

      // then
      expect(weeklyBudgetStub.updateExpenseLabel).to.have.been.calledOnceWith(
        expenseIdToUpdate,
        "JODI"
      );
    });
    it("should throw an error if weekly budget does not exist", function () {
      // given
      const expenseIdToUpdate = "expense-to-delete";
      const expenseToUpdate = new WeeklyExpense({
        id: expenseIdToUpdate,
        amount: 10,
        label: "JOW",
        isChecked: true,
        date: new Date(),
      });
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 1",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 2",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 3",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 4",
            amount: 200,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "Semaine 5",
            amount: 200,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
            expenses: [expenseToUpdate],
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when / then
      expect(() =>
        account.updateExpenseLabelFromWeeklyBudget(
          "not-existing-weekly-id",
          expenseIdToUpdate,
          "JODI"
        )
      ).to.throw(WeeklyBudgetNotFoundError);
    });
  });
  describe("#updateExpenseWeeklyBudget", function () {
    it("should change the weekly budget of the expense", function () {
      // given
      const expenseIdToMove = "expense-id";
      const expenseToMove = new WeeklyExpense({
        id: expenseIdToMove,
        label: "JOW",
        amount: 10,
        date: new Date(),
        isChecked: true,
      });
      const originalWeeklyId = "original-weekly-id";
      const originalWeekly = new WeeklyBudget({
        id: originalWeeklyId,
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [expenseToMove],
      });
      const newWeeklyId = "new-weekly-id";
      const newWeekly = new WeeklyBudget({
        id: newWeeklyId,
        name: "Semaine 2",
        initialBalance: 200,
      });
      const account = new Account({
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "TAN",
            amount: 50,
          }),
        ],
        weeklyBudgets: [
          originalWeekly,
          newWeekly,
          new WeeklyBudget({
            id: "uuid-3",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid-4",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid-5",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      });

      // when
      account.updateExpenseWeeklyBudget(
        originalWeeklyId,
        newWeeklyId,
        expenseIdToMove
      );

      // then
      expect(newWeekly.expenses).to.deep.equal([expenseToMove]);
      expect(originalWeekly.expenses).to.deep.equal([]);
    });
    it("should not change when original id and new id are the same", function () {
      // given
      const expenseIdToMove = "expense-id";
      const expenseToMove = new WeeklyExpense({
        id: expenseIdToMove,
        label: "JOW",
        amount: 10,
        date: new Date(),
        isChecked: true,
      });
      const originalWeeklyId = "original-weekly-id";
      const originalWeekly = new WeeklyBudget({
        id: originalWeeklyId,
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [expenseToMove],
      });
      const account = new Account({
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: "uuid",
            label: "TAN",
            amount: 50,
          }),
        ],
        weeklyBudgets: [
          originalWeekly,
          new WeeklyBudget({
            id: "uuid-2",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid-3",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid-4",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid-5",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      });

      // when
      account.updateExpenseWeeklyBudget(
        originalWeeklyId,
        originalWeeklyId,
        expenseIdToMove
      );

      // then
      expect(originalWeekly.expenses).to.deep.equal([expenseToMove]);
    });
  });
  describe("#deleteOutflow", () => {
    it("should delete the outflow", () => {
      // given
      const targetedOutflowId = "targeted-outflow-uuid";
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [
          new AccountOutflow({
            id: targetedOutflowId,
            label: "outflow",
            amount: 10.05,
            isChecked: false,
          }),
          new AccountOutflow({
            id: "uuid",
            label: "outlfow",
            amount: 10.05,
            isChecked: true,
          }),
        ],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.deleteOutflow(targetedOutflowId);

      // then
      expect(account.outflows).to.have.length(1);
    });
  });
  describe("#addOutflow", function () {
    it("should add the outflow to the list", function () {
      // given
      const newOutflow = new AccountOutflow({
        id: "uuid",
        amount: 10,
        label: "TAN",
      });
      const currentOutflows = [
        new AccountOutflow({
          id: "uuid",
          label: "outlfow",
          amount: 10.05,
          isChecked: true,
        }),
      ];
      const props = {
        id: "uuid",
        currentBalance: 2000,
        outflows: [...currentOutflows],
        weeklyBudgets: [
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new WeeklyBudget({
            id: "uuid",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
      };
      const account = new Account(props);

      // when
      account.addOutflow(newOutflow);

      // then
      expect(account.outflows).to.deep.equal([...currentOutflows, newOutflow]);
    });
  });

  describe("#addBudget", function () {
    it("should add the budget to the list", function () {
      // given
      const newBudget = new WeeklyBudget({
        id: "uuid",
        name: "Vacances",
        initialBalance: 100,
      });
      const currentBudgets = [
        new WeeklyBudget({
          id: "uuid",
          name: "Semaine 1",
          initialBalance: 200,
        }),
      ];
      const props = {
        id: "uuid",
        currentBalance: 2000,
        weeklyBudgets: [...currentBudgets],
      };
      const account = new Account(props);

      // when
      account.addBudget(newBudget);

      // then
      expect(account.weeklyBudgets).to.deep.equal([
        ...currentBudgets,
        newBudget,
      ]);
    });
  });

  describe("#updateBudget", function () {
    it("should update the budget", function () {
      // given
      const targetBudget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
      });
      targetBudget.updateName = sinon.spy();
      const currentBudgets = [targetBudget];
      const props = {
        id: "uuid",
        currentBalance: 2000,
        weeklyBudgets: [...currentBudgets],
      };
      const account = new Account(props);

      // when
      account.updateBudget("uuid", "new name");

      // then
      expect(targetBudget.updateName).to.have.been.calledOnceWithExactly(
        "new name"
      );
    });
  });
});
