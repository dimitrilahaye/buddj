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

  transferBalanceTo(to: Transferable, amount: number) {
    to.processTransfer(amount);
    this.weeklyBudget.initialBalance -= amount;
    this.weeklyBudget.calculateCurrentBalance();
  }

  processTransfer(amount: number) {
    this.weeklyBudget.initialBalance += amount;
    this.weeklyBudget.calculateCurrentBalance();
  }
}
