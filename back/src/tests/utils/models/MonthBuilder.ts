import IdProvider from "../../../providers/IdProvider.js";
import Account from "../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../core/models/month/account/WeeklyBudget.js";
import WeeklyExpense from "../../../core/models/month/account/WeeklyExpense.js";
import Month from "../../../core/models/month/Month.js";

const idProvider = new IdProvider();

export default class MonthBuilder {
  builtOutflows: AccountOutflow[] = [];
  builtWeeklyBudgets = [
    new WeeklyBudget({
      id: idProvider.get(),
      name: "Semaine 1",
      initialBalance: 200,
    }),
    new WeeklyBudget({
      id: idProvider.get(),
      name: "Semaine 2",
      initialBalance: 200,
    }),
    new WeeklyBudget({
      id: idProvider.get(),
      name: "Semaine 3",
      initialBalance: 200,
    }),
    new WeeklyBudget({
      id: idProvider.get(),
      name: "Semaine 4",
      initialBalance: 200,
    }),
    new WeeklyBudget({
      id: idProvider.get(),
      name: "Semaine 5",
      initialBalance: 200,
    }),
  ];
  builtAccountCurrentBalance = 2000;

  get set() {
    return {
      accountCurrentBalance: (currentBalance: number) => {
        this.builtAccountCurrentBalance = currentBalance;

        return this;
      },
      weeklyBudgetInitialBalance: (initialBalance: number) => ({
        toWeek: (weekName: string) => {
          const week = this.builtWeeklyBudgets.find((w) => w.name === weekName);
          if (week) {
            week.initialBalance = initialBalance;
          }
          return this;
        },
      }),
    };
  }

  get add() {
    return {
      outflow: (outflow: AccountOutflow) => {
        this.builtOutflows.push(outflow);
        return this;
      },
      expense: (expense: WeeklyExpense) => ({
        toWeek: (weekName: string) => {
          const week = this.builtWeeklyBudgets.find((w) => w.name === weekName);
          if (week) {
            week.addExpense(expense);
          }
          return this;
        },
      }),
    };
  }

  get(date?: Date) {
    return new Month({
      id: idProvider.get(),
      date: date ?? new Date(),
      isArchived: false,
      account: new Account({
        id: idProvider.get(),
        currentBalance: this.builtAccountCurrentBalance,
        outflows: this.builtOutflows,
        weeklyBudgets: this.builtWeeklyBudgets,
      }),
    });
  }
}
