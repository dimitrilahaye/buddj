import Transferable from "../Transferable.js";
import TransferableMonth from "../TransferableMonth.js";
import TransferableWeeklyBudget from "../TransferableWeeklyBudget.js";

type ToWeeklyBudget = {
  weeklyBudget: (id: string) => () => void;
  account: (id: string) => () => void;
};
type ToAccount = {
  account: (id: string) => () => void;
};

export default class TransferBalanceBuilder {
  private month: TransferableMonth;
  private fromData: Transferable | null = null;
  private toData: Transferable | null = null;
  private amount: number;

  constructor(month: TransferableMonth, amount: number) {
    this.month = month;
    this.amount = amount;
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

          this.transferBalance();
        },
        account: (id: string) => {
          this.toData = this.month.findAccountById(id);

          this.transferBalance();
        },
      } as any as T extends TransferableWeeklyBudget
        ? ToWeeklyBudget
        : ToAccount;
    }
    return {
      weeklyBudget: (id: string) => {
        this.toData = this.month.findWeeklyBudgetById(id);

        this.transferBalance();
      },
    } as any as T extends TransferableWeeklyBudget ? ToWeeklyBudget : ToAccount;
  }

  private transferBalance() {
    this.fromData.transferBalanceTo(this.toData, this.amount);
  }
}
