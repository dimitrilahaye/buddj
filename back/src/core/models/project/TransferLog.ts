import ProjectAmount from "./ProjectAmount.js";

export default class TransferLog {
  public amount: ProjectAmount;
  public date: Date;
  public isActive: boolean;

  constructor(amount: ProjectAmount, date: Date, isActive: boolean = true) {
    this.amount = amount;
    this.date = date;
    this.isActive = isActive;
  }

  setActive() {
    this.isActive = true;
  }

  setInactive() {
    this.isActive = false;
  }

  canBeReApplied() {
    return this.isActive === false;
  }

  canBeRollback() {
    return this.isActive === true;
  }
}
