import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import IdProvider from "../../../../../providers/IdProvider.js";
import MonthFactory from "../../../../../core/factories/MonthFactory.js";
import Month from "../../../../../core/models/month/Month.js";
import MonthRepository from "../../../../../providers/persistence/repositories/MonthRepository.js";
import {
  insertArchivedMonth,
  insertUnarchivedMonth,
} from "../../../../utils/persistence/seeds/MonthSeeds.js";
import WeeklyExpenseFactory from "../../../../../core/factories/WeeklyExpenseFactory.js";
import { WeeklyExpenseDao } from "../../../../../providers/persistence/entities/WeeklyExpense.js";
import { WeeklyBudgetDao } from "../../../../../providers/persistence/entities/WeeklyBudget.js";
import AccountOutflowFactory from "../../../../../core/factories/AccountOutflowFactory.js";
import AccountBudgetFactory from "../../../../../core/factories/AccountBudgetFactory.js";
import { OutflowDao } from "../../../../../providers/persistence/entities/Outflow.js";
import { AccountDao } from "../../../../../providers/persistence/entities/Account.js";
import { MonthDao } from "../../../../../providers/persistence/entities/Month.js";
import TransferableMonth from "../../../../../core/models/transferable-month/TransferableMonth.js";

describe("Integration | Providers | Persistence | Repositories | MonthRepository", function () {
  afterEach(async () => {
    await clearDB();
  });

  describe("#save", function () {
    it("should return persisted month instance", async function () {
      // given
      const idProvider = new IdProvider();
      const monthFactory = new MonthFactory(idProvider);
      const repository = new MonthRepository();
      const newMonth = monthFactory.create({
        date: new Date(),
        initialBalance: 2000,
        outflows: [
          {
            label: "outlfow",
            amount: 10.05,
          },
        ],
        weeklyBudgets: [
          {
            name: "Semaine 1",
            initialBalance: 200,
          },
          {
            name: "Semaine 2",
            initialBalance: 200,
          },
          {
            name: "Semaine 3",
            initialBalance: 200,
          },
          {
            name: "Semaine 4",
            initialBalance: 200,
          },
          {
            name: "Semaine 5",
            initialBalance: 200,
          },
        ],
      });

      // when
      const persistedMonth = await repository.save(newMonth);

      // then
      expect(persistedMonth).to.be.instanceof(Month);
      expect(persistedMonth.id).to.be.equal(newMonth.id);
      expect(persistedMonth.account.outflows).to.have.lengthOf(1);
      expect(persistedMonth.account.weeklyBudgets).to.have.lengthOf(5);
    });
  });

  describe("#findAllUnarchived", function () {
    it("should return all unarchived months", async function () {
      // given
      const persistedUnarchivedMonth = await insertUnarchivedMonth();
      await insertArchivedMonth();

      const repository = new MonthRepository();

      // when
      const foundUnarchivedMonths = await repository.findAllUnarchived();

      // then
      expect(foundUnarchivedMonths).to.have.length(1);
      expect(foundUnarchivedMonths[0].id).to.be.equal(
        persistedUnarchivedMonth.id
      );
      expect(foundUnarchivedMonths[0]).to.be.instanceof(Month);
    });
  });

  describe("#getById", function () {
    it("should return the right month by its id", async function () {
      // given
      const { id } = await insertUnarchivedMonth();

      const repository = new MonthRepository();

      // when
      const foundMonth = await repository.getById(id);

      // then
      expect(foundMonth).to.be.instanceof(Month);
      expect(foundMonth?.id).to.be.equal(id);
    });
    it("should return null if month does not exist", async function () {
      // given
      const repository = new MonthRepository();
      const unknownMonthId = "abcc0550-2ef7-4841-beec-ef34e59669c2";

      // when
      const foundMonth = await repository.getById(unknownMonthId);

      // then
      expect(foundMonth).to.be.null;
    });
  });

  describe("#addExpenseToWeeklyBudget", () => {
    it("should persist the new expense", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const idProvider = new IdProvider();
      const expenseFactory = new WeeklyExpenseFactory(idProvider);
      const repository = new MonthRepository();
      const weeklyId = month.account.weeklyBudgets[0].id;
      const newExpense = expenseFactory.create({
        amount: 10,
        label: "JOW",
      });

      // when
      await repository.addExpenseToWeeklyBudget(month, weeklyId, newExpense);

      // then
      const persistedExpense = await WeeklyExpenseDao.findOneByOrFail({
        id: newExpense.id,
      });
      expect(persistedExpense).not.to.be.null;
      const persistedWeeklyBudget = await WeeklyBudgetDao.findOneByOrFail({
        id: weeklyId,
      });
      const foundExpenseIntoWeeklyBudget = persistedWeeklyBudget.expenses.find(
        (expense) => expense.id === persistedExpense.id
      );
      expect(foundExpenseIntoWeeklyBudget).not.to.be.null;
    });
  });

  describe("#addOutflow", () => {
    it("should add outflow", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      const idProvider = new IdProvider();
      const outflowFactory = new AccountOutflowFactory(idProvider);
      const newOutflow = outflowFactory.create({
        amount: 10,
        label: "JOW",
      });

      // when
      await repository.addOutflow(month, newOutflow);

      // then
      const persistedOutflow = await OutflowDao.findOneByOrFail({
        id: newOutflow.id,
      });
      expect(persistedOutflow).not.to.be.null;
      const persistedAccount = await AccountDao.findOneByOrFail({
        id: month.account.id,
      });
      const foundOutflowIntoAccount = persistedAccount.outflows.find(
        (outflow) => outflow.id === persistedOutflow.id
      );
      expect(foundOutflowIntoAccount).not.to.be.null;
    });
  });

  describe("#addBudget", () => {
    it("should add budget", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      const idProvider = new IdProvider();
      const budgetFactory = new AccountBudgetFactory(idProvider);
      const newBudget = budgetFactory.create({
        initialBalance: 100,
        name: "Vacances",
      });

      // when
      await repository.addBudget(month, newBudget);

      // then
      const persistedBudget = await WeeklyBudgetDao.findOneByOrFail({
        id: newBudget.id,
      });
      expect(persistedBudget).not.to.be.null;
      const persistedAccount = await AccountDao.findOneByOrFail({
        id: month.account.id,
      });
      const foundBudgetIntoAccount = persistedAccount.weeklyBudgets.find(
        (budget) => budget.id === persistedBudget.id
      );
      expect(foundBudgetIntoAccount).not.to.be.null;
    });
  });

  describe("#updateAccountCurrentBalance", () => {
    it("should update the current balance", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      month.updateAccountCurrentBalance(9999);

      // when
      await repository.updateAccountCurrentBalance(month);

      // then
      const updatedMonth = await MonthDao.findOneByOrFail({ id: month.id });
      expect(updatedMonth.account.currentBalance).to.be.equal("9999");
    });
  });

  describe("#deleteExpense", () => {
    it("should delete the expense", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      const idProvider = new IdProvider();
      const expenseFactory = new WeeklyExpenseFactory(idProvider);
      const weeklyId = month.account.weeklyBudgets[0].id;
      const expense = expenseFactory.create({
        amount: 10,
        label: "JOW",
      });
      month.addExpenseToWeeklyBudget(weeklyId, expense);
      await repository.save(month);

      // when
      await repository.deleteExpense(expense.id);

      // then
      const persistedExpense = await WeeklyExpenseDao.findOneBy({
        id: expense.id,
      });
      expect(persistedExpense).to.be.null;
      const persistedWeeklyBudget = await WeeklyBudgetDao.findOneByOrFail({
        id: weeklyId,
      });
      expect(persistedExpense).not.to.be.oneOf(persistedWeeklyBudget.expenses);
    });
  });

  describe("#deleteOutflow", () => {
    it("should delete the outflow", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      const idProvider = new IdProvider();
      const outflowFactory = new AccountOutflowFactory(idProvider);
      const outflow = outflowFactory.create({
        amount: 10,
        label: "JOW",
      });
      month.addOutflow(outflow);
      await repository.save(month);

      // when
      await repository.deleteOutflow(outflow.id);

      // then
      const persistedOutflow = await OutflowDao.findOneBy({ id: outflow.id });
      expect(persistedOutflow).to.be.null;
      const persistedAccount = await AccountDao.findOneByOrFail({
        id: month.account.id,
      });
      expect(persistedOutflow).not.to.be.oneOf(persistedAccount.outflows);
    });
  });

  describe("#updateBudget", () => {
    it("should update the budget", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      const idProvider = new IdProvider();
      const factory = new AccountBudgetFactory(idProvider);
      const budget = factory.create({
        initialBalance: 100,
        name: "Vacanss",
      });
      month.addBudget(budget);
      await repository.save(month);

      // when
      await repository.updateBudget(budget.id, "Vacances");

      // then
      const persistedBudget = await WeeklyBudgetDao.findOneByOrFail({
        id: budget.id,
      });
      expect(persistedBudget.name).to.be.equal("Vacances");
    });
  });

  describe("#manageOutflowsChecking", () => {
    it("should check and uncheck outflows", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      const idProvider = new IdProvider();
      const outflowFactory = new AccountOutflowFactory(idProvider);
      const outflowToCheck = outflowFactory.create({
        amount: 10,
        label: "JOW",
      });
      outflowToCheck.uncheck();
      const outflowToUncheck = outflowFactory.create({
        amount: 10,
        label: "JOW",
      });
      outflowToUncheck.check();
      month.addOutflow(outflowToCheck);
      month.addOutflow(outflowToUncheck);
      await repository.save(month);

      // when
      await repository.manageOutflowsChecking([
        {
          id: outflowToCheck.id,
          isChecked: true,
        },
        {
          id: outflowToUncheck.id,
          isChecked: false,
        },
      ]);

      // then
      const persistedOutflowToCheck = await OutflowDao.findOneByOrFail({
        id: outflowToCheck.id,
      });
      expect(persistedOutflowToCheck.isChecked).to.be.true;
      const persistedOutflowToUncheck = await OutflowDao.findOneByOrFail({
        id: outflowToUncheck.id,
      });
      expect(persistedOutflowToUncheck.isChecked).to.be.false;
    });
  });

  describe("#manageExpensesChecking", () => {
    it("should check and uncheck expenses", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      const idProvider = new IdProvider();
      const expenseFactory = new WeeklyExpenseFactory(idProvider);
      const firstWeeklyId = month.account.weeklyBudgets[0].id;
      const expenseToCheck = expenseFactory.create({
        amount: 10,
        label: "JOW",
      });
      expenseToCheck.uncheck();
      const secondWeeklyId = month.account.weeklyBudgets[1].id;
      const expenseToUncheck = expenseFactory.create({
        amount: 10,
        label: "JOW",
      });
      expenseToUncheck.check();
      month.addExpenseToWeeklyBudget(firstWeeklyId, expenseToCheck);
      month.addExpenseToWeeklyBudget(secondWeeklyId, expenseToUncheck);
      await repository.save(month);

      // when
      await repository.manageExpensesChecking(month, [
        {
          id: firstWeeklyId,
          expenses: [
            {
              id: expenseToCheck.id,
              isChecked: true,
            },
          ],
        },
        {
          id: secondWeeklyId,
          expenses: [
            {
              id: expenseToUncheck.id,
              isChecked: false,
            },
          ],
        },
      ]);

      // then
      const persistedExpenseToCheck = await WeeklyExpenseDao.findOneByOrFail({
        id: expenseToCheck.id,
      });
      expect(persistedExpenseToCheck.isChecked).to.be.true;
      const persistedExpenseToUncheck = await WeeklyExpenseDao.findOneByOrFail({
        id: expenseToUncheck.id,
      });
      expect(persistedExpenseToUncheck.isChecked).to.be.false;
    });
  });

  describe("#archive", () => {
    it("should archive the month", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      month.archive();

      // when
      await repository.archive(month);

      // then
      const persistedMonth = await MonthDao.findOneByOrFail({ id: month.id });
      expect(persistedMonth.isArchived).to.be.true;
    });
  });

  describe("#updateWeeklyBudgetCurrentBalance", () => {
    it("should update the current balance of the given weekly budget", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      const [weekly] = month.account.weeklyBudgets;
      weekly.currentBalance = 9999;

      // when
      await repository.updateWeeklyBudgetCurrentBalance(month, weekly.id);

      // then
      const updatedWeeklyBudget = await WeeklyBudgetDao.findOneByOrFail({
        id: weekly.id,
      });
      expect(updatedWeeklyBudget.currentBalance).to.be.equal("9999");
    });
  });

  describe("#findAllArchived", () => {
    it("should return the list of archived months", async () => {
      // given
      await insertUnarchivedMonth();
      const archivedMonth = await insertArchivedMonth();
      const repository = new MonthRepository();

      // when
      const list = await repository.findAllArchived();

      // then
      expect(list).to.have.length(1);
      expect(list[0].id).to.be.equal(archivedMonth.id);
    });
  });

  describe("#unarchive", () => {
    it("should unarchive the month", async () => {
      // given
      const monthDao = await insertArchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      month.unarchive();

      // when
      await repository.unarchive(month);

      // then
      const persistedMonth = await MonthDao.findOneByOrFail({ id: month.id });
      expect(persistedMonth.isArchived).to.be.false;
    });
  });

  describe("#delete", () => {
    it("should delete the month", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();

      // when
      await repository.delete(month);

      // then
      const persistedMonth = await MonthDao.findOneBy({ id: month.id });
      expect(persistedMonth).to.be.null;
      const persistedAccount = await AccountDao.findOneBy({
        id: month.account.id,
      });
      expect(persistedAccount).to.be.null;
    });
  });

  describe("#getTransferableById", function () {
    it("should return the right month by its id", async function () {
      // given
      const { id } = await insertUnarchivedMonth();

      const repository = new MonthRepository();

      // when
      const foundMonth = await repository.getTransferableById(id);

      // then
      expect(foundMonth).to.be.instanceof(TransferableMonth);
      expect(foundMonth?.month.id).to.be.equal(id);
    });
    it("should return null if month does not exist", async function () {
      // given
      const repository = new MonthRepository();
      const unknownMonthId = "abcc0550-2ef7-4841-beec-ef34e59669c2";

      // when
      const foundMonth = await repository.getTransferableById(unknownMonthId);

      // then
      expect(foundMonth).to.be.null;
    });
  });

  describe("#updateWeeklyBudgetInitialBalance", () => {
    it("should update the initial balance of the given weekly budget", async () => {
      // given
      const monthDao = await insertUnarchivedMonth();
      const month = monthDao.toDomain();
      const repository = new MonthRepository();
      const [weekly] = month.account.weeklyBudgets;
      weekly.initialBalance = 9999;

      // when
      await repository.updateWeeklyBudgetInitialBalance(month, weekly.id);

      // then
      const updatedWeeklyBudget = await WeeklyBudgetDao.findOneByOrFail({
        id: weekly.id,
      });
      expect(updatedWeeklyBudget.initialBalance).to.be.equal("9999");
    });
  });
});
