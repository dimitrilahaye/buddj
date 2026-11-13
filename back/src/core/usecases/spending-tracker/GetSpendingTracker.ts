import TrackedSpendingRepository from "../../ports/repositories/TrackedSpendingRepository.js";
import GetSpendingTrackerCommand from "../../commands/GetSpendingTrackerCommand.js";
import SpendingTracker from "../../models/spending-tracker/SpendingTracker.js";
import ParisCalendar from "../../models/spending-tracker/ParisCalendar.js";
import { SpendingTrackerRangeError } from "../../errors/SpendingTrackerErrors.js";

export default class GetSpendingTracker {
  constructor(
    public readonly trackedSpendingRepository: TrackedSpendingRepository
  ) {}

  async execute(command: GetSpendingTrackerCommand): Promise<SpendingTracker> {
    if (command.from > command.to) {
      throw new SpendingTrackerRangeError();
    }

    const entries = await this.trackedSpendingRepository.findBetween(
      ParisCalendar.parisMidnight(command.from),
      ParisCalendar.parisMidnight(ParisCalendar.addDays(command.to, 1))
    );

    return new SpendingTracker({
      granularity: command.granularity,
      from: command.from,
      to: command.to,
      entries,
    });
  }
}
