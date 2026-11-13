import TrackedSpendingRepository from "../../ports/repositories/TrackedSpendingRepository.js";
import UntrackSpendingCommand from "../../commands/UntrackSpendingCommand.js";

export default class UntrackSpending {
  constructor(
    public readonly trackedSpendingRepository: TrackedSpendingRepository
  ) {}

  async execute(command: UntrackSpendingCommand): Promise<void> {
    await this.trackedSpendingRepository.deleteBySource(
      command.kind,
      command.sourceId
    );
  }
}
