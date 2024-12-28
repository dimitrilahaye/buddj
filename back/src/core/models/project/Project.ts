import ProjectAmount from "./ProjectAmount.js";
import ProjectName from "./ProjectName.js";
import ProjectTarget from "./ProjectTarget.js";
import TransferLog from "./TransferLog.js";
import TransferLogs from "./TransferLogs.js";

export default abstract class Project {
  public id: string;
  public name: ProjectName;
  public target: ProjectTarget;
  public logs: TransferLogs;

  constructor(
    id: string,
    name: ProjectName,
    target: ProjectTarget,
    logs: TransferLogs
  ) {
    this.id = id;
    this.name = name;
    this.target = target;
    this.logs = logs;
  }

  updateName(name: ProjectName) {
    this.name = name;
  }

  updateTarget(target: ProjectTarget) {
    this.target = target;
  }

  add(amount: ProjectAmount) {
    this.logs.add(new TransferLog(amount, new Date(), true));
  }

  totalAmount() {
    const activeLogs = this.logs.getActiveLogs();
    const totalAmount = activeLogs.reduce((total, log) => {
      return Number((total + log.amount.value).toFixed(2));
    }, 0);
    if (totalAmount > this.target.value) {
      return this.target.value;
    }
    return Number(totalAmount.toFixed(2));
  }

  rollback() {
    this.logs.rollback();
  }

  reApply() {
    this.logs.reApply();
  }

  canRollback() {
    return this.logs.canRollback();
  }

  canReApply() {
    return this.logs.canReApply();
  }
}
