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

  transferRemainingBalanceTo(to: Transferable) {
    to.processTransfer(this.account.currentBalance);
    if (this.account.currentBalance >= 0) {
      this.account.updateCurrentBalance(
        this.account.currentBalance - this.account.currentBalance
      );
    }
    if (this.account.currentBalance < 0) {
      this.account.updateCurrentBalance(
        this.account.currentBalance + Math.abs(this.account.currentBalance)
      );
    }
  }

  processTransfer(amount: number) {
    if (amount >= 0) {
      this.account.updateCurrentBalance(this.account.currentBalance + amount);
    }
    if (amount < 0) {
      this.account.updateCurrentBalance(
        this.account.currentBalance - Math.abs(amount)
      );
    }
  }
}
