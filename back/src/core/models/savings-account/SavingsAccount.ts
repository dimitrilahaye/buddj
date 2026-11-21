import SavingsAccountOperation from "./SavingsAccountOperation.js";

export default class SavingsAccount {
  id: string;
  name: string;
  /** Solde du compte, recalculé à partir des opérations */
  amount: number;
  /** Triées par date décroissante */
  operations: SavingsAccountOperation[];

  constructor(props: {
    id: string;
    name: string;
    amount: number;
    operations: SavingsAccountOperation[];
  }) {
    this.id = props.id;
    this.name = props.name;
    this.amount = props.amount;
    this.operations = props.operations;
  }

  findOperation(operationId: string): SavingsAccountOperation | undefined {
    return this.operations.find((operation) => operation.id === operationId);
  }
}
