import SavingsAccountRepository from "../../ports/repositories/SavingsAccountRepository.js";
import SavingsAccount from "../../models/savings-account/SavingsAccount.js";
import { UpdateSavingsAccountOperationCommand } from "../../commands/SavingsAccountCommands.js";
import {
  SavingsAccountNotFoundError,
  SavingsAccountOperationNotFoundError,
} from "../../errors/SavingsAccountErrors.js";
import operationFromCommand from "./operationFromCommand.js";

export default class UpdateSavingsAccountOperation {
  constructor(
    public readonly savingsAccountRepository: SavingsAccountRepository
  ) {}

  async execute(
    command: UpdateSavingsAccountOperationCommand
  ): Promise<SavingsAccount> {
    const account = await this.savingsAccountRepository.findById(
      command.savingsAccountId
    );
    if (!account) {
      throw new SavingsAccountNotFoundError();
    }
    if (!account.findOperation(command.operationId)) {
      throw new SavingsAccountOperationNotFoundError();
    }

    const operation = operationFromCommand(command.operationId, command);
    await this.savingsAccountRepository.saveOperation(operation);

    return (await this.savingsAccountRepository.findById(
      command.savingsAccountId
    )) as SavingsAccount;
  }
}
