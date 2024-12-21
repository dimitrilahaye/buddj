import PendingBudget from "../../models/pending-debit/PendingBudget.js";
import PendingOutflow from "../../models/pending-debit/PendingOutflow.js";

export type PendingDebits = {
  outflows: PendingOutflow[];
  budgets: PendingBudget[];
};

interface PendingDebitRepository {
  getAll(): Promise<PendingDebits>;
}

export default PendingDebitRepository;
