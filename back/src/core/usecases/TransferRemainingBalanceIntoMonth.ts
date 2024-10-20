import { MonthNotFoundError } from "../errors/MonthErrors.js";
import { TransferRemainingBalanceIntoMonthError } from "../errors/TransferRemainingBalanceIntoMonthErrors.js";
import Month from "../models/month/Month.js";
import TransferableAccount from "../models/transferable-month/TransferableAccount.js";
import TransferableWeeklyBudget from "../models/transferable-month/TransferableWeeklyBudget.js";
import MonthRepository from "../ports/repositories/MonthRepository.js";

export interface TransferRemainingBalanceIntoMonthCommand {
  monthId: string;
  fromAccountId?: string;
  toWeeklyBudgetId?: string;
  fromWeeklyBudgetId?: string;
  toAccountId?: string;
}

export default class TransferRemainingBalanceIntoMonth {
  constructor(private monthRepository: MonthRepository) {}

  async execute({
    monthId,
    fromAccountId,
    toWeeklyBudgetId,
    fromWeeklyBudgetId,
    toAccountId,
  }: TransferRemainingBalanceIntoMonthCommand): Promise<Month> {
    const month = await this.monthRepository.getTransferableById(monthId);
    if (!month) {
      throw new MonthNotFoundError();
    }

    if (fromAccountId && toWeeklyBudgetId) {
      month.transferRemainingBalance
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
      month.transferRemainingBalance
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
      month.transferRemainingBalance
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
      throw new TransferRemainingBalanceIntoMonthError();
    }

    return month.month;
  }
}
