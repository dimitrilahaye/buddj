import MonthRepository from "../../../core/ports/repositories/MonthRepository.js";
import Month from "../../../core/models/month/Month.js";
import { MonthDao } from "../entities/Month.js";
import WeeklyExpense from "../../../core/models/month/account/WeeklyExpense.js";
import { WeeklyExpenseDao } from "../entities/WeeklyExpense.js";
import { WeeklyBudgetDao } from "../entities/WeeklyBudget.js";
import { OutflowDao } from "../entities/Outflow.js";
import AccountOutflow from "../../../core/models/month/account/AccountOutflow.js";
import { AccountDao } from "../entities/Account.js";
import TransferableMonth from "../../../core/models/transferable-month/TransferableMonth.js";
import WeeklyBudget from "../../../core/models/month/account/WeeklyBudget.js";

export default class TypeOrmMonthRepository implements MonthRepository {
  async addExpenseToWeeklyBudget(
    month: Month,
    weeklyId: string,
    expense: WeeklyExpense
  ): Promise<void> {
    const weekly = month.account.weeklyBudgets.find(
      (weekly) => weekly.id === weeklyId
    );
    const weeklyDao = await WeeklyBudgetDao.findOne({
      where: { id: weeklyId },
    });
    if (weekly && weeklyDao) {
      const expenseDao = WeeklyExpenseDao.fromDomain(expense);
      expenseDao.weeklyBudget = weeklyDao;
      await expenseDao.save();
      await WeeklyBudgetDao.getRepository().update(weeklyDao.id, {
        currentBalance: weekly.currentBalance,
      });
    }
  }

  async addOutflow(month: Month, outflow: AccountOutflow): Promise<void> {
    const accountDao = await AccountDao.findOne({
      where: { id: month.account.id },
    });
    const outflowDao = OutflowDao.fromDomain(outflow);
    if (accountDao) {
      outflowDao.account = accountDao;
      await outflowDao.save();
    }
  }

  async addBudget(month: Month, budget: WeeklyBudget): Promise<void> {
    const accountDao = await AccountDao.findOne({
      where: { id: month.account.id },
    });
    const budgetDao = WeeklyBudgetDao.fromDomain(budget);
    if (accountDao) {
      budgetDao.account = accountDao;
      await budgetDao.save();
    }
  }

  async updateBudget(budgetId: string, name: string): Promise<void> {
    await WeeklyBudgetDao.update(budgetId, {
      name,
    });
  }

  async updateAccountCurrentBalance(month: Month): Promise<void> {
    await AccountDao.update(month.account.id, {
      currentBalance: month.account.currentBalance,
    });
  }

  async manageOutflowsChecking(
    outflows: {
      id: string;
      isChecked: boolean;
    }[]
  ): Promise<void> {
    for (const { id, isChecked } of outflows) {
      await OutflowDao.update(id, {
        isChecked,
      });
    }
  }

  async manageExpensesChecking(
    month: Month,
    weeklyBudgets: {
      id: string;
      expenses: { id: string; isChecked: boolean }[];
    }[]
  ): Promise<void> {
    for (const { id, expenses } of weeklyBudgets) {
      const weekly = month.account.weeklyBudgets.find(
        (weekly) => weekly.id === id
      );
      if (weekly) {
        await WeeklyBudgetDao.update(weekly.id, {
          currentBalance: weekly.currentBalance,
        });
        for (const { id: expenseId, isChecked } of expenses) {
          await WeeklyExpenseDao.update(expenseId, {
            isChecked,
          });
        }
      }
    }
  }

  async archive(month: Month): Promise<void> {
    await MonthDao.getRepository().update(month.id, {
      isArchived: month.isArchived,
    });
  }

  async unarchive(month: Month): Promise<void> {
    await MonthDao.getRepository().update(month.id, {
      isArchived: month.isArchived,
    });
  }

  async save(month: Month): Promise<Month> {
    const dao = MonthDao.fromDomain(month);
    const savedMonth = await dao.save();

    return savedMonth.toDomain();
  }

  async findAllUnarchived(): Promise<Month[]> {
    const unarchivedMonths = await MonthDao.find({
      where: {
        isArchived: false,
      },
    });

    return unarchivedMonths.map((month) => {
      return month.toDomain();
    });
  }

  async getById(monthId: string): Promise<Month | null> {
    const dao = await MonthDao.findOne({ where: { id: monthId } });
    if (dao === null) {
      return null;
    }

    return dao.toDomain();
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await WeeklyExpenseDao.getRepository().delete(expenseId);
  }

  async deleteOutflow(outflowId: string): Promise<void> {
    await OutflowDao.getRepository().delete(outflowId);
  }

  async updateWeeklyBudgetCurrentBalance(
    month: Month,
    weeklyId: string
  ): Promise<void> {
    const weekly = month.account.weeklyBudgets.find(
      (weekly) => weekly.id === weeklyId
    );
    if (weekly) {
      await WeeklyBudgetDao.update(weeklyId, {
        currentBalance: weekly.currentBalance,
      });
    }
  }

  async findAllArchived(): Promise<Month[]> {
    const archivedMonths = await MonthDao.find({
      where: {
        isArchived: true,
      },
    });

    return archivedMonths.map((month) => {
      return month.toDomain();
    });
  }

  async delete(month: Month): Promise<void> {
    await MonthDao.delete(month.id);
    await AccountDao.delete(month.account.id);
  }

  async getTransferableById(
    monthId: string
  ): Promise<TransferableMonth | null> {
    const dao = await MonthDao.findOne({ where: { id: monthId } });
    if (dao === null) {
      return null;
    }

    return new TransferableMonth(dao.toDomain());
  }

  async updateWeeklyBudgetInitialBalance(
    month: Month,
    weeklyId: string
  ): Promise<void> {
    const weekly = month.account.weeklyBudgets.find(
      (weekly) => weekly.id === weeklyId
    );
    if (weekly) {
      await WeeklyBudgetDao.update(weeklyId, {
        initialBalance: weekly.initialBalance,
      });
    }
  }
}
