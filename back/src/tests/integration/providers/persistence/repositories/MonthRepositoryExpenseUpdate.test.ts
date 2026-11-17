import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import IdProvider from "../../../../../providers/IdProvider.js";
import MonthRepository from "../../../../../providers/persistence/repositories/MonthRepository.js";
import { insertUnarchivedMonth } from "../../../../utils/persistence/seeds/MonthSeeds.js";
import WeeklyExpenseFactory from "../../../../../core/factories/WeeklyExpenseFactory.js";
import { WeeklyExpenseDao } from "../../../../../providers/persistence/entities/WeeklyExpense.js";
import { WeeklyBudgetDao } from "../../../../../providers/persistence/entities/WeeklyBudget.js";

const idProvider = new IdProvider();

describe("Integration | Providers | Persistence | Repositories | MonthRepository | expense update", function () {
  afterEach(async () => {
    await clearDB();
  });

  describe("MonthRepository#save after an expense update", () => {
    it("should persist the expense label, amount and the budget balance", async () => {
      // given
      const month = (await insertUnarchivedMonth()).toDomain();
      const repository = new MonthRepository();
      const weeklyId = month.account.weeklyBudgets[0].id;
      const expense = new WeeklyExpenseFactory(idProvider).create({
        amount: 10,
        label: "JOW",
      });
      month.addExpenseToWeeklyBudget(weeklyId, expense);
      await repository.addExpenseToWeeklyBudget(month, weeklyId, expense);

      month.updateExpenseAmountFromWeeklyBudget(weeklyId, expense.id, 25);
      month.updateExpenseLabelFromWeeklyBudget(weeklyId, expense.id, "Courses");

      // when
      await repository.save(month);

      // then
      const persisted = await WeeklyExpenseDao.findOneByOrFail({
        id: expense.id,
      });
      expect(persisted.label).to.equal("Courses");
      expect(Number(persisted.amount)).to.equal(25);
      const weekly = month.account.weeklyBudgets[0];
      const persistedWeekly = await WeeklyBudgetDao.findOneByOrFail({
        id: weeklyId,
      });
      expect(Number(persistedWeekly.currentBalance)).to.equal(
        weekly.currentBalance
      );
    });
  });
});
