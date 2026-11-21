import type { SpendingGranularity } from '../spending-tracker/spending-tracker-types.js';
import type {
  SavingsAccountView,
  SavingsOperationInput,
  SavingsTrackerView,
} from './savings-account-types.js';

export interface SavingsAccountService {
  getAll(): Promise<SavingsAccountView[]>;
  addOperation(input: { savingsAccountId: string; operation: SavingsOperationInput }): Promise<SavingsAccountView>;
  updateOperation(input: {
    savingsAccountId: string;
    operationId: string;
    operation: SavingsOperationInput;
  }): Promise<SavingsAccountView>;
  deleteOperation(input: { savingsAccountId: string; operationId: string }): Promise<SavingsAccountView>;
  getTracker(input: {
    savingsAccountId: string;
    granularity: SpendingGranularity;
    from: string;
    to: string;
  }): Promise<SavingsTrackerView>;
}
