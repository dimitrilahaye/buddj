import SavingsAccount from "../../../core/models/savings-account/SavingsAccount.js";
import { SavingsAccountOperationType } from "../../../core/models/savings-account/SavingsAccountOperation.js";
import SavingsAccountTracker, {
  SavingsAccountBucket,
} from "../../../core/models/savings-account/SavingsAccountTracker.js";
import { SpendingTrackerGranularity } from "../../../core/commands/GetSpendingTrackerCommand.js";

export type SavingsAccountOperationDTO = {
  id: string;
  type: SavingsAccountOperationType;
  amount: number;
  label: string | null;
  date: string;
};

export type SavingsAccountDTO = {
  id: string;
  name: string;
  amount: number;
  operations: SavingsAccountOperationDTO[];
};

export type SavingsAccountTrackerDTO = {
  savingsAccountId: string;
  granularity: SpendingTrackerGranularity;
  from: string;
  to: string;
  openingBalance: number;
  closingBalance: number;
  depositsTotal: number;
  withdrawalsTotal: number;
  net: number;
  buckets: SavingsAccountBucket[];
};

export type SavingsAccountDtoBuilder = (
  account: SavingsAccount
) => SavingsAccountDTO;

export type SavingsAccountTrackerDtoBuilder = (
  tracker: SavingsAccountTracker
) => SavingsAccountTrackerDTO;

export function savingsAccountDto(account: SavingsAccount): SavingsAccountDTO {
  return {
    id: account.id,
    name: account.name,
    amount: account.amount,
    operations: account.operations.map((operation) => ({
      id: operation.id,
      type: operation.type,
      amount: operation.amount,
      label: operation.label,
      date: operation.date,
    })),
  };
}

export function savingsAccountTrackerDto(
  tracker: SavingsAccountTracker
): SavingsAccountTrackerDTO {
  return {
    savingsAccountId: tracker.savingsAccountId,
    granularity: tracker.granularity,
    from: tracker.from,
    to: tracker.to,
    openingBalance: tracker.openingBalance,
    closingBalance: tracker.closingBalance,
    depositsTotal: tracker.depositsTotal,
    withdrawalsTotal: tracker.withdrawalsTotal,
    net: tracker.net,
    buckets: tracker.buckets.map((bucket) => ({ ...bucket })),
  };
}
