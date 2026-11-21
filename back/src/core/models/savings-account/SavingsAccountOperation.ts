export type SavingsAccountOperationType = "deposit" | "withdrawal";

export default class SavingsAccountOperation {
  id: string;
  savingsAccountId: string;
  type: SavingsAccountOperationType;
  amount: number;
  label: string | null;
  /** Jour calendaire de l'opération (YYYY-MM-DD) */
  date: string;

  constructor(props: {
    id: string;
    savingsAccountId: string;
    type: SavingsAccountOperationType;
    amount: number;
    label: string | null;
    date: string;
  }) {
    this.id = props.id;
    this.savingsAccountId = props.savingsAccountId;
    this.type = props.type;
    this.amount = props.amount;
    this.label = props.label;
    this.date = props.date;
  }

  /** Montant signé : positif pour un ajout, négatif pour un retrait */
  get signedAmount(): number {
    return this.type === "deposit" ? this.amount : -this.amount;
  }
}
