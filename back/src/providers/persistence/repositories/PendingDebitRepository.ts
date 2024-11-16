import PendingDebit from "../../../core/models/pending-debit/PendingDebit.js";
import PendingDebitRepository from "../../../core/ports/repositories/PendingDebitRepository.js";
import { MonthDao } from "../entities/Month.js";

export default class TypeOrmPendingDebitRepository
  implements PendingDebitRepository
{
  async getAll(): Promise<PendingDebit[]> {
    const monthRepository = MonthDao.getRepository();

    const outflowResults = await monthRepository
      .createQueryBuilder("month")
      .leftJoinAndSelect("month.account", "account")
      .leftJoinAndSelect(
        "account.outflows",
        "outflow",
        "outflow.isChecked = :isChecked"
      )
      .where("outflow.id IS NOT NULL")
      .setParameter("isChecked", false)
      .select([
        "month.id AS month_id",
        "month.date AS month_date",
        "outflow.id AS outflow_id",
        "outflow.label AS outflow_label",
        "outflow.amount AS outflow_amount",
        "outflow.isChecked AS outflow_is_checked",
      ])
      .getRawMany();

    const expenseResults = await monthRepository
      .createQueryBuilder("month")
      .leftJoinAndSelect("month.account", "account")
      .leftJoinAndSelect("account.weeklyBudgets", "weeklyBudget")
      .leftJoinAndSelect(
        "weeklyBudget.expenses",
        "expense",
        "expense.isChecked = :isChecked"
      )
      .where("expense.id IS NOT NULL")
      .setParameter("isChecked", false)
      .select([
        "month.id AS month_id",
        "month.date AS month_date",
        "expense.id AS expense_id",
        "expense.label AS expense_label",
        "expense.amount AS expense_amount",
        "expense.isChecked AS expense_is_checked",
      ])
      .getRawMany();

    const results = [...outflowResults, ...expenseResults];

    console.info(JSON.stringify(results, null, 2));

    return results.map((result) => {
      return new PendingDebit({
        id: result.expense_id ?? result.outflow_id,
        monthId: result.month_id,
        monthDate: new Date(result.month_date),
        label: result.expense_label ?? result.outflow_label,
        amount: Number(result.expense_amount ?? result.outflow_amount),
        type: result.expense_id ? "expense" : "outflow",
      });
    });
  }
}
