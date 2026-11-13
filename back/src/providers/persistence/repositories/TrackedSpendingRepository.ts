import { And, LessThan, MoreThanOrEqual } from "typeorm";
import TrackedSpending, {
  TrackedSpendingKind,
} from "../../../core/models/spending-tracker/TrackedSpending.js";
import TrackedSpendingRepository from "../../../core/ports/repositories/TrackedSpendingRepository.js";
import { TrackedSpendingDao } from "../entities/TrackedSpending.js";

export default class TypeormTrackedSpendingRepository
  implements TrackedSpendingRepository
{
  async save(trackedSpending: TrackedSpending): Promise<void> {
    await TrackedSpendingDao.createQueryBuilder()
      .insert()
      .values(TrackedSpendingDao.fromDomain(trackedSpending))
      .orIgnore()
      .execute();
  }

  async deleteBySource(
    kind: TrackedSpendingKind,
    sourceId: string
  ): Promise<void> {
    await TrackedSpendingDao.delete({ kind, sourceId });
  }

  async findBetween(from: Date, to: Date): Promise<TrackedSpending[]> {
    const daos = await TrackedSpendingDao.find({
      where: { occurredAt: And(MoreThanOrEqual(from), LessThan(to)) },
      order: { occurredAt: "ASC" },
    });
    return daos.map((dao) => dao.toDomain());
  }
}
