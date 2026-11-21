import IdProvider from "../../ports/providers/IdProvider.js";
import SavingsAccountRepository from "../../ports/repositories/SavingsAccountRepository.js";
import SavingsAccount from "../../models/savings-account/SavingsAccount.js";
import { AddSavingsAccountOperationCommand } from "../../commands/SavingsAccountCommands.js";
import { SavingsAccountNotFoundError } from "../../errors/SavingsAccountErrors.js";
import operationFromCommand from "./operationFromCommand.js";

export default class AddSavingsAccountOperation {
  constructor(
    public readonly idProvider: IdProvider,
    public readonly savingsAccountRepository: SavingsAccountRepository
  ) {}

  async execute(
    command: AddSavingsAccountOperationCommand
  ): Promise<SavingsAccount> {
    const account = await this.savingsAccountRepository.findById(
      command.savingsAccountId
    );
    if (!account) {
      throw new SavingsAccountNotFoundError();
    }

    const operation = operationFromCommand(this.idProvider.get(), command);
    await this.savingsAccountRepository.saveOperation(operation);

    return (await this.savingsAccountRepository.findById(
      command.savingsAccountId
    )) as SavingsAccount;
  }
}
