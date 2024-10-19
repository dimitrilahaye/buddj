import WeeklyBudget from "../month/account/WeeklyBudget.js";
import Transferable from "./Transferable.js";

export default class TransferableWeeklyBudget implements Transferable {
  weeklyBudget: WeeklyBudget;

  constructor(weeklyBudget: WeeklyBudget) {
    this.weeklyBudget = weeklyBudget;
  }

  get id() {
    return this.weeklyBudget.id;
  }

  transferRemainingBalanceTo(to: Transferable) {
    to.processTransfer(this.weeklyBudget.currentBalance);
    if (this.weeklyBudget.currentBalance >= 0) {
      this.weeklyBudget.initialBalance -= this.weeklyBudget.currentBalance;
    }
    if (this.weeklyBudget.currentBalance < 0) {
      this.weeklyBudget.initialBalance += Math.abs(
        this.weeklyBudget.currentBalance
      );
    }
    this.weeklyBudget.calculateCurrentBalance();
  }

  processTransfer(amount: number) {
    if (amount >= 0) {
      this.weeklyBudget.initialBalance += amount;
    }
    if (amount < 0) {
      this.weeklyBudget.initialBalance -= Math.abs(amount);
    }
    this.weeklyBudget.calculateCurrentBalance();
  }
}
