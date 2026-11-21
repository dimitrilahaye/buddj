import SavingsAccount from "../../models/savings-account/SavingsAccount.js";
import SavingsAccountOperation from "../../models/savings-account/SavingsAccountOperation.js";

export default interface SavingsAccountRepository {
  /** Comptes avec leurs opérations, triées par date décroissante */
  findAll(): Promise<SavingsAccount[]>;

  /** Compte avec ses opérations, triées par date décroissante */
  findById(savingsAccountId: string): Promise<SavingsAccount | null>;

  /** Crée ou met à jour l'opération puis recalcule le solde du compte, atomiquement */
  saveOperation(operation: SavingsAccountOperation): Promise<void>;

  /** Supprime l'opération puis recalcule le solde du compte, atomiquement */
  deleteOperation(savingsAccountId: string, operationId: string): Promise<void>;
}
