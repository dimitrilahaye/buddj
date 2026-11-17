import TrackedSpendingRepository from "../../ports/repositories/TrackedSpendingRepository.js";
import UpdateTrackedSpendingCommand from "../../commands/UpdateTrackedSpendingCommand.js";

export default class UpdateTrackedSpending {
  constructor(
    public readonly trackedSpendingRepository: TrackedSpendingRepository
  ) {}

  async execute(command: UpdateTrackedSpendingCommand): Promise<void> {
    await this.trackedSpendingRepository.updateBySource(
      command.kind,
      command.sourceId,
      { label: command.label, amount: command.amount }
    );
  }
}
