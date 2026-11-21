import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import SavingsAccount from "../../../core/models/savings-account/SavingsAccount.js";
import SavingsAccountOperation from "../../../core/models/savings-account/SavingsAccountOperation.js";

/** Hors cycle de vie des mois : aucun lien avec months/accounts. */
@Entity({ name: "savings_accounts" })
export class SavingsAccountDao extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  /** Solde, uniquement recalculé à partir des opérations */
  @Column({ type: "decimal", default: 0 })
  amount: number;

  toDomain(operations: SavingsAccountOperation[]): SavingsAccount {
    return new SavingsAccount({
      id: this.id,
      name: this.name,
      amount: Number(this.amount),
      operations,
    });
  }
}
