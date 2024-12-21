import PendingBudget from "../../../core/models/pending-debit/PendingBudget.js";
import PendingOutflow from "../../../core/models/pending-debit/PendingOutflow.js";
import PendingDebitRepository, {
  PendingDebits,
} from "../../../core/ports/repositories/PendingDebitRepository.js";
import { MonthDao } from "../entities/Month.js";

export default class TypeOrmPendingDebitRepository
  implements PendingDebitRepository
{
  async getAll(): Promise<PendingDebits> {
    const monthsFromDb = await MonthDao.find();
    const months = monthsFromDb.map((month) => month.toDomain());
    const budgets = months.flatMap((month) => {
      const foundBudgets = month.account.weeklyBudgets.filter(
        (budget) =>
          budget.currentBalance > 0 ||
          budget.expenses.filter((expense) => expense.isChecked === false)
      );
      return foundBudgets.map(
        (budget) => new PendingBudget(budget, month.date)
      );
    });
    const outflows = months.flatMap((month) => {
      return month.account.outflows
        .filter((outflow) => outflow.isChecked === false)
        .map((outflow) => new PendingOutflow(outflow, month.date));
    });

    return {
      outflows,
      budgets,
    };
  }
}
