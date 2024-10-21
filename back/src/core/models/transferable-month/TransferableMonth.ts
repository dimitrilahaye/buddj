import {
  TransferableAccountNotFoundError,
  TransferableWeeklyBudgetNotFoundError,
} from "../../errors/TransferableMonthErrors.js";
import Month from "../month/Month.js";
import TransferRemainingBalanceBuilder from "./builder/TransferRemainingBalanceBuilder.js";
import TransferableAccount from "./TransferableAccount.js";
import TransferableWeeklyBudget from "./TransferableWeeklyBudget.js";

export default class TransferableMonth {
  public readonly builder: TransferRemainingBalanceBuilder;
  month: Month;

  constructor(month: Month) {
    this.month = month;
    this.builder = new TransferRemainingBalanceBuilder(this);
  }

  get transferRemainingBalance() {
    return this.builder;
  }

  findAccountById(id: string): TransferableAccount {
    if (this.month.account.id !== id) {
      throw new TransferableAccountNotFoundError();
    }

    return new TransferableAccount(this.month.account);
  }

  findWeeklyBudgetById(id: string): TransferableWeeklyBudget {
    const weeklyBudget = this.month.account.weeklyBudgets.find(
      (w) => w.id === id
    );
    if (!weeklyBudget) {
      throw new TransferableWeeklyBudgetNotFoundError();
    }

    return new TransferableWeeklyBudget(weeklyBudget);
  }
}
