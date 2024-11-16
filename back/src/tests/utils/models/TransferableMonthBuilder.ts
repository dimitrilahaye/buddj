import AccountOutflow from "../../../core/models/month/account/AccountOutflow.js";
import WeeklyExpense from "../../../core/models/month/account/WeeklyExpense.js";
import Month from "../../../core/models/month/Month.js";
import TransferableMonth from "../../../core/models/transferable-month/TransferableMonth.js";
import MonthBuilder from "./MonthBuilder.js";

export default class TransferableMonthBuilder {
  month: Month;

  constructor() {
    const monthBuilder = new MonthBuilder();
    this.month = monthBuilder.add
      .outflow(
        new AccountOutflow({
          id: "outflow-1-uuid",
          amount: 190,
          label: "my outflow",
        })
      )
      .get();
  }

  get set() {
    return {
      account: {
        currentBalance: (currentBalance: number) => {
          this.month.updateAccountCurrentBalance(currentBalance);
          return this;
        },
      },
      weeklyBudget: (weekName: string) => {
        const currentWeeklyBudget =
          this.month.account.weeklyBudgets.find((w) => w.name === weekName) ??
          null;
        return {
          initialBalance: (initialBalance: number) => {
            if (currentWeeklyBudget) {
              currentWeeklyBudget.initialBalance = initialBalance;
            }
            return this;
          },
          currentBalance: (currentBalance: number) => {
            if (currentWeeklyBudget) {
              const expenseAmount =
                currentWeeklyBudget.initialBalance - currentBalance;
              currentWeeklyBudget.addExpense(
                new WeeklyExpense({
                  id: "id",
                  date: new Date(),
                  label: "label",
                  amount: expenseAmount,
                })
              );
            }
            return this;
          },
        };
      },
    };
  }

  getTransferable() {
    return new TransferableMonth(this.month);
  }

  getMonth() {
    return this.month;
  }
}
