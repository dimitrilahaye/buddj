import EventPublisher from "../../ports/providers/EventPublisher.js";
import MonthRepository from "../../ports/repositories/MonthRepository.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";
import ManageOutflowsCheckingCommand from "../../commands/ManageOutflowsCheckingCommand.js";
import AccountOutflow from "../../models/month/account/AccountOutflow.js";

export default class ManageOutflowsChecking {
  constructor(
    public monthRepository: MonthRepository,
    public readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: ManageOutflowsCheckingCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.updateAccountCurrentBalance(command.currentBalance);

    /** Seules les transitions d'état sont suivies : une sortie renvoyée telle quelle ne publie rien */
    const checkedOutflows: AccountOutflow[] = [];
    const uncheckedOutflowIds: string[] = [];

    command.outflows.forEach((outflow) => {
      const wasChecked = month.findOutflow(outflow.id).isChecked;
      if (outflow.isChecked) {
        month.checkOutflow(outflow.id);
        if (!wasChecked) {
          checkedOutflows.push(month.findOutflow(outflow.id));
        }
      }
      if (!outflow.isChecked) {
        month.uncheckOutflow(outflow.id);
        if (wasChecked) {
          uncheckedOutflowIds.push(outflow.id);
        }
      }
    });

    await this.monthRepository.updateAccountCurrentBalance(month);

    await this.monthRepository.manageOutflowsChecking(command.outflows);

    const occurredAt = new Date();
    checkedOutflows.forEach((outflow) =>
      this.eventPublisher.publish("outflowChecked", {
        outflowId: outflow.id,
        label: outflow.label,
        amount: outflow.amount,
        occurredAt,
      })
    );
    uncheckedOutflowIds.forEach((outflowId) =>
      this.eventPublisher.publish("outflowUnchecked", { outflowId })
    );

    return month;
  }
}
