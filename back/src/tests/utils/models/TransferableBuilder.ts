import Account from "../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../core/models/month/account/WeeklyBudget.js";
import WeeklyExpense from "../../../core/models/month/account/WeeklyExpense.js";
import TransferableAccount from "../../../core/models/transferable-month/TransferableAccount.js";
import TransferableWeeklyBudget from "../../../core/models/transferable-month/TransferableWeeklyBudget.js";

export default class TransferableBuilder {
  private accountProps: any | null = null;
  private account: Account | null = null;
  private weeklyBudgets: WeeklyBudget[] = [];

  get set() {
    return {
      account: (id: string) => {
        this.accountProps = {
          id,
          outflows: [],
          currentBalance: 2000,
          weeklyBudgets: [],
        };
        return {
          currentBalance: (currentBalance: number) => {
            this.accountProps.currentBalance = currentBalance;
            return this;
          },
        };
      },
      weeklyBudget: (id: string) => {
        let weeklyBudget = this.weeklyBudgets.find((w) => w.id === id);
        if (!weeklyBudget) {
          weeklyBudget = new WeeklyBudget({
            id,
            name: id,
            initialBalance: 200,
          });
          this.weeklyBudgets.push(weeklyBudget);
        }
        return {
          initialBalance: (initialBalance: number) => {
            weeklyBudget.initialBalance = initialBalance;
            return this;
          },
          currentBalance: (currentBalance: number) => {
            const expenseAmount = weeklyBudget.initialBalance - currentBalance;
            weeklyBudget.addExpense(
              new WeeklyExpense({
                id: "id",
                date: new Date(),
                label: "label",
                amount: expenseAmount,
              })
            );
            return this;
          },
        };
      },
    };
  }

  get() {
    if (!this.accountProps) {
      this.accountProps = {
        id: "id",
        outflows: [],
        currentBalance: 2000,
        weeklyBudgets: [],
      };
    }
    this.accountProps.weeklyBudgets.push(...this.weeklyBudgets);
    while (this.accountProps.weeklyBudgets.length < 5) {
      this.accountProps.weeklyBudgets.push(
        new WeeklyBudget({
          id: "id",
          name: "name",
          initialBalance: 200,
        })
      );
    }
    this.account = new Account({
      ...this.accountProps,
      outflows: [
        new AccountOutflow({
          id: "outflow-1-uuid",
          amount: 190,
          label: "my outflow",
        }),
      ],
    });
    return {
      accountInstances: {
        account: this.account,
        transferable: new TransferableAccount(this.account),
      },
      weeklyBudgetInstances: {
        weeklyBudgets: this.weeklyBudgets,
        transferables: this.weeklyBudgets.map(
          (w) => new TransferableWeeklyBudget(w)
        ),
      },
    };
  }
}
