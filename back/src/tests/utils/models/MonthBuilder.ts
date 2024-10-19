import Account from "../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../core/models/month/account/WeeklyBudget.js";
import WeeklyExpense from "../../../core/models/month/account/WeeklyExpense.js";
import Month from "../../../core/models/month/Month.js";

export default class MonthBuilder {
  builtOutflows: AccountOutflow[] = [];
  builtWeeklyBudgets = [
    new WeeklyBudget({
      id: "semaine-1-uuid",
      name: "Semaine 1",
      initialBalance: 200,
    }),
    new WeeklyBudget({
      id: "semaine-2-uuid",
      name: "Semaine 2",
      initialBalance: 200,
    }),
    new WeeklyBudget({
      id: "semaine-3-uuid",
      name: "Semaine 3",
      initialBalance: 200,
    }),
    new WeeklyBudget({
      id: "semaine-4-uuid",
      name: "Semaine 4",
      initialBalance: 200,
    }),
    new WeeklyBudget({
      id: "semaine-5-uuid",
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

  get get() {
    return new Month({
      id: "month-uuid",
      date: new Date(),
      isArchived: false,
      account: new Account({
        id: "account-uuid",
        currentBalance: this.builtAccountCurrentBalance,
        outflows: this.builtOutflows,
        weeklyBudgets: this.builtWeeklyBudgets,
      }),
    });
  }
}
