import {
  BaseEntity,
  Check,
  Column,
  Entity,
  Index,
  PrimaryColumn,
  Unique,
} from "typeorm";
import TrackedSpending, {
  TrackedSpendingKind,
} from "../../../core/models/spending-tracker/TrackedSpending.js";

/** Aucune FK : les lignes survivent à la suppression des mois, dépenses et sorties. */
@Entity({ name: "tracked_spendings" })
@Unique("UQ_tracked_spendings_kind_source_id", ["kind", "sourceId"])
@Check("CHK_tracked_spendings_kind", `"kind" IN ('expense', 'outflow')`)
export class TrackedSpendingDao extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  kind: TrackedSpendingKind;

  @Column({ type: "uuid", name: "source_id" })
  sourceId: string;

  @Column({ type: "varchar" })
  label: string;

  @Column({ type: "decimal" })
  amount: number;

  @Index("IDX_tracked_spendings_occurred_at")
  @Column({ type: "timestamptz", name: "occurred_at" })
  occurredAt: Date;

  static fromDomain(model: TrackedSpending) {
    return TrackedSpendingDao.create({
      id: model.id,
      kind: model.kind,
      sourceId: model.sourceId,
      label: model.label,
      amount: Number(model.amount),
      occurredAt: new Date(model.occurredAt),
    });
  }

  toDomain(): TrackedSpending {
    return new TrackedSpending({
      id: this.id,
      kind: this.kind,
      sourceId: this.sourceId,
      label: this.label,
      amount: Number(this.amount),
      occurredAt: new Date(this.occurredAt),
    });
  }
}
