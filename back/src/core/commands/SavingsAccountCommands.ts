import { SavingsAccountOperationType } from "../models/savings-account/SavingsAccountOperation.js";
import { SpendingTrackerGranularity } from "./GetSpendingTrackerCommand.js";

export interface AddSavingsAccountOperationCommand {
  savingsAccountId: string;
  type: SavingsAccountOperationType;
  amount: number;
  label: string | null;
  /** YYYY-MM-DD */
  date: string;
}

export interface UpdateSavingsAccountOperationCommand
  extends AddSavingsAccountOperationCommand {
  operationId: string;
}

export interface DeleteSavingsAccountOperationCommand {
  savingsAccountId: string;
  operationId: string;
}

export interface GetSavingsAccountTrackerCommand {
  savingsAccountId: string;
  granularity: SpendingTrackerGranularity;
  /** Jour de début inclus (YYYY-MM-DD) */
  from: string;
  /** Jour de fin inclus (YYYY-MM-DD) */
  to: string;
}
