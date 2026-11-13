import IdProvider from "../../ports/providers/IdProvider.js";
import TrackedSpendingRepository from "../../ports/repositories/TrackedSpendingRepository.js";
import TrackSpendingCommand from "../../commands/TrackSpendingCommand.js";
import TrackedSpending from "../../models/spending-tracker/TrackedSpending.js";

export default class TrackSpending {
  constructor(
    public readonly idProvider: IdProvider,
    public readonly trackedSpendingRepository: TrackedSpendingRepository
  ) {}

  async execute(command: TrackSpendingCommand): Promise<void> {
    const trackedSpending = new TrackedSpending({
      id: this.idProvider.get(),
      kind: command.kind,
      sourceId: command.sourceId,
      label: command.label,
      amount: command.amount,
      occurredAt: command.occurredAt,
    });

    await this.trackedSpendingRepository.save(trackedSpending);
  }
}
