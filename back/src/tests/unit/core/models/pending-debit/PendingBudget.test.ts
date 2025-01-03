import expect from "../../../../test-helpers.js";
import PendingBudget from "../../../../../core/models/pending-debit/PendingBudget.js";
import WeeklyBudget from "../../../../../core/models/month/account/WeeklyBudget.js";
import WeeklyExpense from "../../../../../core/models/month/account/WeeklyExpense.js";

describe("unit | core | models | pending-debit | PendingBudget", () => {
  describe("#constructor", () => {
    it("should instantiate pending debit with right data with expenses", () => {
      // Given
      const checkedExpense = new WeeklyExpense({
        id: "uuid",
        label: "JOW",
        amount: 10,
        date: new Date(),
        isChecked: true,
      });
      const uncheckedExpense = new WeeklyExpense({
        id: "uuid",
        label: "JOW",
        amount: 20,
        date: new Date(),
        isChecked: false,
      });
      const budget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
        expenses: [checkedExpense, uncheckedExpense],
      });
      const monthDate = new Date("2022-01-01");

      // When
      const pendingBudget = new PendingBudget(budget, monthDate);

      // Then
      expect(pendingBudget.id).to.be.deep.equal(budget.id);
      expect(pendingBudget.name).to.be.deep.equal(budget.name);
      expect(pendingBudget.initialBalance).to.equal(190);
      expect(pendingBudget.currentBalance).to.equal(170);
      expect(pendingBudget.pendingFrom).to.equal(monthDate);
      expect(pendingBudget.expenses).to.deep.equal([uncheckedExpense]);
    });

    it("should instantiate pending debit with right data without expenses", () => {
      // Given
      const budget = new WeeklyBudget({
        id: "uuid",
        name: "Semaine 1",
        initialBalance: 200,
      });
      const monthDate = new Date("2022-01-01");

      // When
      const pendingBudget = new PendingBudget(budget, monthDate);

      // Then
      expect(pendingBudget.id).to.be.deep.equal(budget.id);
      expect(pendingBudget.name).to.be.deep.equal(budget.name);
      expect(pendingBudget.pendingFrom).to.equal(monthDate);
      expect(pendingBudget.initialBalance).to.equal(200);
      expect(pendingBudget.currentBalance).to.equal(200);
    });
  });
});
