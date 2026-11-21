import SavingsAccountRepository from "../../ports/repositories/SavingsAccountRepository.js";
import SavingsAccount from "../../models/savings-account/SavingsAccount.js";

export default class GetSavingsAccounts {
  constructor(
    public readonly savingsAccountRepository: SavingsAccountRepository
  ) {}

  async execute(): Promise<SavingsAccount[]> {
    return this.savingsAccountRepository.findAll();
  }
}
