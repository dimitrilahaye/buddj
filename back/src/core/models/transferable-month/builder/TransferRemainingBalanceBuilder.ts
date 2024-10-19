import Transferable from "../Transferable.js";
import TransferableAccount from "../TransferableAccount.js";
import TransferableMonth from "../TransferableMonth.js";
import TransferableWeeklyBudget from "../TransferableWeeklyBudget.js";

type ToWeeklyBudget = {
  weeklyBudget: (id: string) => () => void;
  account: (id: string) => () => void;
};
type ToAccount = {
  account: (id: string) => () => void;
};

export default class TransferRemainingBalanceBuilder {
  private month: TransferableMonth;
  private fromData: Transferable | null = null;
  private toData: Transferable | null = null;

  constructor(month: TransferableMonth) {
    this.month = month;
  }

  from() {
    return {
      weeklyBudget: (id: string) => {
        this.fromData = this.month.findWeeklyBudgetById(id);

        return this;
      },
      account: (id: string) => {
        this.fromData = this.month.findAccountById(id);

        return this;
      },
    };
  }

  to<T>(): T extends TransferableWeeklyBudget ? ToWeeklyBudget : ToAccount {
    if (this.fromData instanceof TransferableWeeklyBudget) {
      return {
        weeklyBudget: (id: string) => {
          this.toData = this.month.findWeeklyBudgetById(id);

          this.transferRemainingBalance();
        },
        account: (id: string) => {
          this.toData = this.month.findAccountById(id);

          this.transferRemainingBalance();
        },
      } as any as T extends TransferableWeeklyBudget
        ? ToWeeklyBudget
        : ToAccount;
    }
    return {
      weeklyBudget: (id: string) => {
        this.toData = this.month.findWeeklyBudgetById(id);

        this.transferRemainingBalance();
      },
    } as any as T extends TransferableWeeklyBudget ? ToWeeklyBudget : ToAccount;
  }

  private transferRemainingBalance() {
    this.fromData.transferRemainingBalanceTo(this.toData);
  }
}
