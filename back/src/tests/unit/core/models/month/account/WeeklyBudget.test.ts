import expect from "../../../../../test-helpers.js";
import sinon from "sinon";
import WeeklyBudget from "../../../../../../core/models/month/account/WeeklyBudget.js";
import {
  AccountBudgetNameCantBeEmptyError,
  WeeklyBudgetInitialBalanceError,
} from "../../../../../../core/errors/WeeklyBudgetErrors.js";
import WeeklyExpense from "../../../../../../core/models/month/account/WeeklyExpense.js";
import { WeeklyExpenseNotFoundError } from "../../../../../../core/errors/WeeklyExpenseErrors.js";

describe("Unit | Core | Models | Month | Account | WeeklyBudget", function () {
  describe("#constructor", function () {
    describe("when there is expenses", () => {
      it("should give a weekly budget with right data", function () {
        // given
        const props = {
          id: "uuid",
          name: "Semaine 1",
          initialBalance: 200,
          expenses: [
            new WeeklyExpense({
              id: "uuid",
              amount: 10,
              label: "JOW",
              date: new Date(),
              isChecked: true,
            }),
            new WeeklyExpense({
              id: "uuid",
              amount: 20,
              label: "JOW",
              date: new Date(),
              isChecked: false,
            }),
          ],
        };

        // when
        const budget = new WeeklyBudget(props);

        // then
        expect(budget).to.deep.equal({
          ...props,
          initialBalance: 200,
          currentBalance: 170,
          startAt: null,
          endAt: null,
        });
      });
    });

    describe("when there is no expense", () => {
      it("should give a weekly budget with right data", function () {
        // given
        const props = {
          id: "uuid",
          name: "Semaine 1",
          initialBalance: 200,
        };

        // when
        const budget = new WeeklyBudget(props);

        // then
        expect(budget).to.deep.equal({
          ...props,
          currentBalance: 200,
          expenses: [],
          startAt: null,
          endAt: null,
        });
      });

      it("should throw an error for an empty name", function () {
        // given
        const props = {
          id: "uuid",
          name: "",
          initialBalance: 200,
        };

        // when / then
        expect(() => new WeeklyBudget(props)).to.throw(
          AccountBudgetNameCantBeEmptyError
        );
      });
    });

    it("should give a weekly budget with right data when current balance is negative", function () {
      // given
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: "uuid",
            amount: 210,
            label: "JOW",
            date: new Date(),
            isChecked: true,
          }),
          new WeeklyExpense({
            id: "uuid",
            amount: 10,
            label: "JOW",
            date: new Date(),
            isChecked: false,
          }),
        ],
      };

      // when
      const budget = new WeeklyBudget(props);

      // then
      expect(budget).to.deep.equal({
        ...props,
        initialBalance: 200,
        currentBalance: -20,
        startAt: null,
        endAt: null,
      });
    });
    it("should give a weekly budget with default empty expenses list", function () {
      // given
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
      };

      // when
      const budget = new WeeklyBudget(props);

      // then
      expect(budget).to.deep.equal({
        ...props,
        currentBalance: 200,
        initialBalance: 200,
        startAt: null,
        endAt: null,
        expenses: [],
      });
    });
    it("should throw an error if current balance is negative", function () {
      // given
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: -200,
      };

      // when / then
      expect(() => new WeeklyBudget(props)).to.throw(
        WeeklyBudgetInitialBalanceError
      );
    });
    it("should throw an error if current balance is 0", function () {
      // given
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 0,
      };

      // when / then
      expect(() => new WeeklyBudget(props)).to.throw(
        WeeklyBudgetInitialBalanceError
      );
    });
  });
  describe("#addExpense", function () {
    it("should add an expense to its list", function () {
      // given
      const existingExpense = new WeeklyExpense({
        id: "uuid",
        amount: 20,
        label: "JOW",
        date: new Date(),
        isChecked: true,
      });
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpense],
      };
      const budget = new WeeklyBudget(props);
      const newExpense = new WeeklyExpense({
        id: "uuid",
        amount: 10,
        label: "JOW",
        date: new Date(),
      });

      // when
      budget.addExpense(newExpense);

      // then
      expect(budget.expenses).to.deep.equal([existingExpense, newExpense]);
      expect(budget.currentBalance).to.be.equal(170);
    });
  });
  describe("#checkExpense", function () {
    it("should check the expense and recalculate the balances when weekly current balance is positive", function () {
      // given
      const existingExpense = new WeeklyExpense({
        id: "expense-uuid",
        amount: 20,
        label: "JOW",
        date: new Date(),
        isChecked: false,
      });
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpense],
      };
      const budget = new WeeklyBudget(props);
      expect(budget.currentBalance).to.be.equal(180);

      // when
      budget.checkExpense(existingExpense.id);

      // then
      expect(budget.expenses[0].isChecked).to.be.true;
    });
    it("should check the expense and recalculate the balances when weekly current balance is negative", function () {
      // given
      const existingExpense = new WeeklyExpense({
        id: "expense-uuid",
        amount: 210,
        label: "JOW",
        date: new Date(),
        isChecked: false,
      });
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpense],
      };
      const budget = new WeeklyBudget(props);
      expect(budget.currentBalance).to.be.equal(-10);

      // when
      budget.checkExpense(existingExpense.id);

      // then
      expect(budget.expenses[0].isChecked).to.be.true;
    });
    it("should throw an error if expense does not exist", function () {
      // given
      const existingExpense = new WeeklyExpense({
        id: "expense-uuid",
        amount: 210,
        label: "JOW",
        date: new Date(),
        isChecked: false,
      });
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpense],
      };
      const budget = new WeeklyBudget(props);

      // when / then
      expect(() => budget.checkExpense("unknown-expense-id")).to.throw(
        WeeklyExpenseNotFoundError
      );
    });
  });
  describe("#uncheckExpense", function () {
    it("should uncheck the expense and recalculate the balances when weekly current balance is positive", function () {
      // given
      const existingExpense = new WeeklyExpense({
        id: "expense-uuid",
        amount: 20,
        label: "JOW",
        date: new Date(),
        isChecked: true,
      });
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpense],
      };
      const budget = new WeeklyBudget(props);
      expect(budget.currentBalance).to.be.equal(180);

      // when
      budget.uncheckExpense(existingExpense.id);

      // then
      expect(budget.expenses[0].isChecked).to.be.false;
    });
    it("should uncheck the expense and recalculate the balances when weekly current balance is negative", function () {
      // given
      const existingExpense = new WeeklyExpense({
        id: "expense-uuid",
        amount: 210,
        label: "JOW",
        date: new Date(),
        isChecked: true,
      });
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpense],
      };
      const budget = new WeeklyBudget(props);
      expect(budget.currentBalance).to.be.equal(-10);

      // when
      budget.uncheckExpense(existingExpense.id);

      // then
      expect(budget.expenses[0].isChecked).to.be.false;
    });
    it("should throw an error if expense does not exist", function () {
      // given
      const existingExpense = new WeeklyExpense({
        id: "expense-uuid",
        amount: 210,
        label: "JOW",
        date: new Date(),
        isChecked: true,
      });
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpense],
      };
      const budget = new WeeklyBudget(props);

      // when / then
      expect(() => budget.uncheckExpense("unknown-expense-id")).to.throw(
        WeeklyExpenseNotFoundError
      );
    });
  });
  describe("#deleteExpenseById", function () {
    it("should delete the expense", function () {
      // given
      const expenseToDeleteId = "expense-to-delete";
      const expenseToDelete = new WeeklyExpense({
        id: expenseToDeleteId,
        amount: 10,
        label: "JOW",
        date: new Date(),
      });
      const budget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [expenseToDelete],
      });

      // when
      budget.deleteExpenseById(expenseToDeleteId);

      // then
      expect(budget.expenses).to.have.length(0);
    });
    it("should recalculate the balances when expense was not checked", function () {
      // given
      const expenseToDeleteId = "expense-to-delete";
      const expenseToDelete = new WeeklyExpense({
        id: expenseToDeleteId,
        amount: 10,
        label: "JOW",
        date: new Date(),
        isChecked: false,
      });
      const budget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: "uuid",
            amount: 20,
            label: "JOW",
            date: new Date(),
            isChecked: true,
          }),
          expenseToDelete,
        ],
      });
      expect(budget.currentBalance).to.be.equal(170);

      // when
      budget.deleteExpenseById(expenseToDeleteId);

      // then
      expect(budget.currentBalance).to.be.equal(180);
    });
    it("should recalculate the balances when expense was checked", function () {
      // given
      const expenseToDeleteId = "expense-to-delete";
      const expenseToDelete = new WeeklyExpense({
        id: expenseToDeleteId,
        amount: 10,
        label: "JOW",
        date: new Date(),
        isChecked: true,
      });
      const budget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: "uuid",
            amount: 20,
            label: "JOW",
            date: new Date(),
            isChecked: true,
          }),
          expenseToDelete,
        ],
      });
      expect(budget.currentBalance).to.be.equal(170);

      // when
      budget.deleteExpenseById(expenseToDeleteId);

      // then
      expect(budget.currentBalance).to.be.equal(180);
    });
  });
  describe("#updateExpenseAmount", function () {
    it("should call the expense to update its amount", function () {
      // given
      const existingExpenseId = "expense-id";
      const existingExpenseStub = new WeeklyExpense({
        id: existingExpenseId,
        amount: 20,
        label: "JOW",
        date: new Date(),
        isChecked: true,
      });
      existingExpenseStub.updateAmount = sinon.stub();
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpenseStub],
      };
      const budget = new WeeklyBudget(props);

      // when
      budget.updateExpenseAmount(existingExpenseId, 20);

      // then
      expect(existingExpenseStub.updateAmount).to.have.been.calledOnceWith(20);
    });
    it("should recalculate the balances when expense was not checked", function () {
      // given
      const existingExpenseId = "expense-id";
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: existingExpenseId,
            amount: 20,
            label: "JOW",
            date: new Date(),
            isChecked: false,
          }),
        ],
      };
      const budget = new WeeklyBudget(props);
      expect(budget.currentBalance).to.be.equal(180);

      // when
      budget.updateExpenseAmount(existingExpenseId, 10);

      // then
      expect(budget.currentBalance).to.be.equal(190);
    });
    it("should recalculate the balances when expense was checked", function () {
      // given
      const existingExpenseId = "expense-id";
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: existingExpenseId,
            amount: 20,
            label: "JOW",
            date: new Date(),
            isChecked: true,
          }),
        ],
      };
      const budget = new WeeklyBudget(props);
      expect(budget.currentBalance).to.be.equal(180);

      // when
      budget.updateExpenseAmount(existingExpenseId, 10);

      // then
      expect(budget.currentBalance).to.be.equal(190);
    });
    it("should throw an error if expense does not exist", function () {
      // given
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: "expense-id",
            amount: 20,
            label: "JOW",
            date: new Date(),
            isChecked: true,
          }),
        ],
      };
      const budget = new WeeklyBudget(props);

      // when / then
      expect(() => budget.updateExpenseAmount("not-existing-id", 20)).to.throw(
        WeeklyExpenseNotFoundError
      );
    });
  });
  describe("#updateExpenseLabel", function () {
    it("should call the expense to update its label", function () {
      // given
      const existingExpenseId = "expense-id";
      const existingExpenseStub = new WeeklyExpense({
        id: existingExpenseId,
        amount: 20,
        label: "JOW",
        date: new Date(),
        isChecked: true,
      });
      existingExpenseStub.updateLabel = sinon.stub();
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [existingExpenseStub],
      };
      const budget = new WeeklyBudget(props);

      // when
      budget.updateExpenseLabel(existingExpenseId, "JODI");

      // then
      expect(existingExpenseStub.updateLabel).to.have.been.calledOnceWith(
        "JODI"
      );
    });
    it("should throw an error if expense does not exist", function () {
      // given
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: "expense-id",
            amount: 20,
            label: "JOW",
            date: new Date(),
            isChecked: true,
          }),
        ],
      };
      const budget = new WeeklyBudget(props);

      // when / then
      expect(() =>
        budget.updateExpenseLabel("not-existing-id", "JODI")
      ).to.throw(WeeklyExpenseNotFoundError);
    });
  });
  describe("#findExpenseById", function () {
    it("should find the expense", function () {
      // given
      const expenseToFindId = "expense-id";
      const expenseToFind = new WeeklyExpense({
        id: expenseToFindId,
        amount: 10,
        label: "JOW",
        date: new Date(),
        isChecked: true,
      });
      const budget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [expenseToFind],
      });

      // when
      const expense = budget.findExpenseById(expenseToFindId);

      // then
      expect(expense).to.deep.equal(expenseToFind);
    });
    it("should throw an error if expense is not found", function () {
      // given
      const budget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: "uuid",
            amount: 10,
            label: "JOW",
            date: new Date(),
            isChecked: true,
          }),
        ],
      });

      // when / then
      expect(() => budget.findExpenseById("not-existing-id")).to.throw(
        WeeklyExpenseNotFoundError
      );
    });
  });
  describe("#updateName", function () {
    it("should update the budget's name", function () {
      // given
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
      };
      const budget = new WeeklyBudget(props);

      // when
      budget.updateName("new name");

      // then
      expect(budget.name).to.equal("new name");
    });

    it("should throw an error if name is empty", function () {
      // given
      const props = {
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
      };
      const budget = new WeeklyBudget(props);

      // when / then
      expect(() => budget.updateName("")).to.throw(
        AccountBudgetNameCantBeEmptyError
      );
    });
  });
  describe("#amountForOutflow", () => {
    it("should give the right amount for outflow calculation when weekly current balance is positive", () => {
      // given
      const budget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: "uuid",
            amount: 10,
            label: "JOW",
            date: new Date(),
            isChecked: false,
          }),
        ],
      });

      expect(budget.currentBalance).to.be.equal(190);

      // then
      expect(budget.amountForOutflow).to.be.equal(200);

      budget.checkExpense("uuid");
      expect(budget.amountForOutflow).to.be.equal(190);
    });
    it("should give the right amount for outflow calculation when weekly current balance is negative", () => {
      // given
      const budget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [
          new WeeklyExpense({
            id: "uuid",
            amount: 210,
            label: "JOW",
            date: new Date(),
            isChecked: false,
          }),
        ],
      });

      expect(budget.currentBalance).to.be.equal(-10);

      // then
      expect(budget.amountForOutflow).to.be.equal(210);

      budget.checkExpense("uuid");
      expect(budget.amountForOutflow).to.be.equal(0);
    });
  });
});
