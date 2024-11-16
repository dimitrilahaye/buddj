import PendingDebit from "../../models/pending-debit/PendingDebit.js";

interface PendingDebitRepository {
  getAll(): Promise<PendingDebit[]>;
}

export default PendingDebitRepository;
