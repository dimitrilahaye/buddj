import Month from "../models/month/Month.js";
import MonthCreationCommand from "../commands/MonthCreationCommand.js";
import Account from "../models/month/account/Account.js";
import AccountOutflow from "../models/month/account/AccountOutflow.js";
import WeeklyBudget from "../models/month/account/WeeklyBudget.js";
import { AccountInitialBalanceError } from "../errors/AccountErrors.js";
import IdProvider from "../ports/providers/IdProvider.js";
import WeeklyExpense from "../models/month/account/WeeklyExpense.js";

export default class MonthFactory {
  constructor(public readonly idProvider: IdProvider) {}

  create(command: MonthCreationCommand): Month {
    if (command.initialBalance <= 0) {
      throw new AccountInitialBalanceError();
    }
    const account = new Account({
      id: this.idProvider.get(),
      currentBalance: command.initialBalance,
      outflows: command.outflows.map((outflow) => {
        return new AccountOutflow({
          id: this.idProvider.get(),
          amount: outflow.amount,
          label: outflow.label,
        });
      }),
      weeklyBudgets: command.weeklyBudgets.map((weeklyBudget) => {
        return new WeeklyBudget({
          id: this.idProvider.get(),
          initialBalance: weeklyBudget.initialBalance,
          name: weeklyBudget.name,
          expenses:
            weeklyBudget.expenses?.map(
              (expense) =>
                new WeeklyExpense({
                  id: this.idProvider.get(),
                  amount: expense.amount,
                  date: expense.date,
                  label: expense.label,
                  isChecked: false,
                })
            ) ?? [],
        });
      }),
    });

    return new Month({
      id: this.idProvider.get(),
      account,
      date: command.date,
    });
  }
}
