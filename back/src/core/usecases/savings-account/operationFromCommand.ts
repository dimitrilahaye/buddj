import SavingsAccountOperation from "../../models/savings-account/SavingsAccountOperation.js";
import { AddSavingsAccountOperationCommand } from "../../commands/SavingsAccountCommands.js";
import { SavingsAccountOperationAmountMustBePositiveError } from "../../errors/SavingsAccountErrors.js";

/** Construit une opération valide ; un libellé vide devient null */
export default function operationFromCommand(
  id: string,
  command: AddSavingsAccountOperationCommand
): SavingsAccountOperation {
  if (!(command.amount > 0)) {
    throw new SavingsAccountOperationAmountMustBePositiveError();
  }
  const label = command.label?.trim() ?? "";
  return new SavingsAccountOperation({
    id,
    savingsAccountId: command.savingsAccountId,
    type: command.type,
    amount: Math.round(command.amount * 100) / 100,
    label: label === "" ? null : label,
    date: command.date,
  });
}
