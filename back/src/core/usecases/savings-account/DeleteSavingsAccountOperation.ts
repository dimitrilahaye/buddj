import SavingsAccountRepository from "../../ports/repositories/SavingsAccountRepository.js";
import SavingsAccount from "../../models/savings-account/SavingsAccount.js";
import { DeleteSavingsAccountOperationCommand } from "../../commands/SavingsAccountCommands.js";
import {
  SavingsAccountNotFoundError,
  SavingsAccountOperationNotFoundError,
} from "../../errors/SavingsAccountErrors.js";

export default class DeleteSavingsAccountOperation {
  constructor(
    public readonly savingsAccountRepository: SavingsAccountRepository
  ) {}

  async execute(
    command: DeleteSavingsAccountOperationCommand
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

    await this.savingsAccountRepository.deleteOperation(
      command.savingsAccountId,
      command.operationId
    );

    return (await this.savingsAccountRepository.findById(
      command.savingsAccountId
    )) as SavingsAccount;
  }
}
