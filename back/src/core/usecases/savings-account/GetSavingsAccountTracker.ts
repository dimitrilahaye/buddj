import SavingsAccountRepository from "../../ports/repositories/SavingsAccountRepository.js";
import SavingsAccountTracker from "../../models/savings-account/SavingsAccountTracker.js";
import { GetSavingsAccountTrackerCommand } from "../../commands/SavingsAccountCommands.js";
import {
  SavingsAccountNotFoundError,
  SavingsAccountTrackerRangeError,
} from "../../errors/SavingsAccountErrors.js";

export default class GetSavingsAccountTracker {
  constructor(
    public readonly savingsAccountRepository: SavingsAccountRepository
  ) {}

  async execute(
    command: GetSavingsAccountTrackerCommand
  ): Promise<SavingsAccountTracker> {
    if (command.from > command.to) {
      throw new SavingsAccountTrackerRangeError();
    }

    const account = await this.savingsAccountRepository.findById(
      command.savingsAccountId
    );
    if (!account) {
      throw new SavingsAccountNotFoundError();
    }

    return new SavingsAccountTracker({
      savingsAccountId: account.id,
      granularity: command.granularity,
      from: command.from,
      to: command.to,
      operations: account.operations,
    });
  }
}
