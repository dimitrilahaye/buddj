import {
  AddedInactiveLogError,
  AddedOlderLogError,
} from "../../errors/ProjectErrors.js";
import TransferLog from "./TransferLog.js";

export default class TransferLogs {
  public logs: TransferLog[];

  constructor(logs: TransferLog[] = []) {
    this.logs = [...logs].toSorted(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }

  getActiveLogs() {
    return this.logs.filter((log) => log.isActive);
  }

  canRollback() {
    if (this.logs.length === 0) {
      return false;
    }
    const notAnyLogCanRollback = this.logs.every((log) => !log.canBeRollback());
    if (notAnyLogCanRollback) {
      return false;
    }
    return true;
  }

  canReApply() {
    if (this.logs.length === 0) {
      return false;
    }
    const notAnyLogCanBeReApplied = this.logs.every(
      (log) => !log.canBeReApplied()
    );
    if (notAnyLogCanBeReApplied) {
      return false;
    }
    return true;
  }

  rollback() {
    if (!this.canRollback()) {
      return;
    }
    const rollbackLogs = this.logs.filter((log) => log.canBeRollback());
    rollbackLogs.at(-1).setInactive();
  }

  reApply() {
    if (!this.canReApply()) {
      return;
    }
    const reApplyLogs = this.logs.filter((log) => log.canBeReApplied());
    reApplyLogs.at(0).setActive();
  }

  add(log: TransferLog) {
    if (log.isActive === false) {
      throw new AddedInactiveLogError();
    }
    if (
      this.logs.length > 0 &&
      log.date.getTime() < this.logs.at(-1).date.getTime()
    ) {
      throw new AddedOlderLogError();
    }
    this.logs = this.logs.filter((log) => log.isActive);
    this.logs.push(log);
  }
}
