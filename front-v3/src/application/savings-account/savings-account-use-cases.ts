import { granularityForRange } from '../spending-tracker/spending-tracker-range.js';
import type { SavingsAccountService } from './savings-account-service.js';
import type {
  SavingsAccountView,
  SavingsOperationInput,
  SavingsTrackerRequest,
  SavingsTrackerView,
} from './savings-account-types.js';

export type LoadSavingsAccountsUseCase = () => Promise<SavingsAccountView[]>;
export type AddSavingsOperationUseCase = (input: {
  savingsAccountId: string;
  operation: SavingsOperationInput;
}) => Promise<SavingsAccountView>;
export type UpdateSavingsOperationUseCase = (input: {
  savingsAccountId: string;
  operationId: string;
  operation: SavingsOperationInput;
}) => Promise<SavingsAccountView>;
export type DeleteSavingsOperationUseCase = (input: {
  savingsAccountId: string;
  operationId: string;
}) => Promise<SavingsAccountView>;
export type LoadSavingsTrackerUseCase = (request: SavingsTrackerRequest) => Promise<SavingsTrackerView>;

export function createLoadSavingsAccounts({
  savingsAccountService,
}: {
  savingsAccountService: SavingsAccountService;
}): LoadSavingsAccountsUseCase {
  return () => savingsAccountService.getAll();
}

export function createAddSavingsOperation({
  savingsAccountService,
}: {
  savingsAccountService: SavingsAccountService;
}): AddSavingsOperationUseCase {
  return (input) => savingsAccountService.addOperation(input);
}

export function createUpdateSavingsOperation({
  savingsAccountService,
}: {
  savingsAccountService: SavingsAccountService;
}): UpdateSavingsOperationUseCase {
  return (input) => savingsAccountService.updateOperation(input);
}

export function createDeleteSavingsOperation({
  savingsAccountService,
}: {
  savingsAccountService: SavingsAccountService;
}): DeleteSavingsOperationUseCase {
  return (input) => savingsAccountService.deleteOperation(input);
}

/** La granularité est déduite de la longueur de la plage, comme pour le suivi des dépenses. */
export function createLoadSavingsTracker({
  savingsAccountService,
}: {
  savingsAccountService: SavingsAccountService;
}): LoadSavingsTrackerUseCase {
  return ({ savingsAccountId, from, to }) =>
    savingsAccountService.getTracker({
      savingsAccountId,
      granularity: granularityForRange({ from, to }),
      from,
      to,
    });
}
