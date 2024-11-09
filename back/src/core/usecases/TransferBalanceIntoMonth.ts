import { MonthNotFoundError } from "../errors/MonthErrors.js";
import { TransferBalanceIntoMonthError } from "../errors/TransferBalanceIntoMonthErrors.js";
import Month from "../models/month/Month.js";
import TransferableAccount from "../models/transferable-month/TransferableAccount.js";
import TransferableWeeklyBudget from "../models/transferable-month/TransferableWeeklyBudget.js";
import MonthRepository from "../ports/repositories/MonthRepository.js";

export interface TransferBalanceIntoMonthCommand {
  monthId: string;
  amount: number;
  fromAccountId?: string;
  toWeeklyBudgetId?: string;
  fromWeeklyBudgetId?: string;
  toAccountId?: string;
}

export default class TransferBalanceIntoMonth {
  constructor(private monthRepository: MonthRepository) {}

  async execute({
    monthId,
    amount,
    fromAccountId,
    toWeeklyBudgetId,
    fromWeeklyBudgetId,
    toAccountId,
  }: TransferBalanceIntoMonthCommand): Promise<Month> {
    const month = await this.monthRepository.getTransferableById(monthId);
    if (!month) {
      throw new MonthNotFoundError();
    }

    if (fromAccountId && toWeeklyBudgetId) {
      month
        .transferBalance(amount)
        .from()
        .account(fromAccountId)
        .to<TransferableWeeklyBudget>()
        .weeklyBudget(toWeeklyBudgetId);

      await this.monthRepository.updateWeeklyBudgetInitialBalance(
        month.month,
        toWeeklyBudgetId
      );
      await this.monthRepository.updateAccountCurrentBalance(month.month);
    } else if (fromWeeklyBudgetId && toAccountId) {
      month
        .transferBalance(amount)
        .from()
        .weeklyBudget(fromWeeklyBudgetId)
        .to<TransferableAccount>()
        .account(toAccountId);

      await this.monthRepository.updateWeeklyBudgetInitialBalance(
        month.month,
        fromWeeklyBudgetId
      );
      await this.monthRepository.updateAccountCurrentBalance(month.month);
    } else if (fromWeeklyBudgetId && toWeeklyBudgetId) {
      month
        .transferBalance(amount)
        .from()
        .weeklyBudget(fromWeeklyBudgetId)
        .to<TransferableWeeklyBudget>()
        .weeklyBudget(toWeeklyBudgetId);

      await this.monthRepository.updateWeeklyBudgetInitialBalance(
        month.month,
        fromWeeklyBudgetId
      );
      await this.monthRepository.updateWeeklyBudgetInitialBalance(
        month.month,
        toWeeklyBudgetId
      );
    } else {
      throw new TransferBalanceIntoMonthError();
    }

    return month.month;
  }
}
