import Account from "../month/account/Account.js";
import Transferable from "./Transferable.js";
import TransferableWeeklyBudget from "./TransferableWeeklyBudget.js";

export default class TransferableAccount implements Transferable {
  account: Account;

  constructor(account: Account) {
    this.account = account;
  }

  get id() {
    return this.account.id;
  }

  get weeklyBudgets() {
    return this.account.weeklyBudgets.map(
      (w) => new TransferableWeeklyBudget(w)
    );
  }

  transferBalanceTo(to: Transferable, amount: number) {
    to.processTransfer(amount);
    //this.account.updateCurrentBalance(this.account.currentBalance - amount);
  }

  processTransfer(_amount: number) {
    //this.account.updateCurrentBalance(this.account.currentBalance + amount);
    return;
  }
}
