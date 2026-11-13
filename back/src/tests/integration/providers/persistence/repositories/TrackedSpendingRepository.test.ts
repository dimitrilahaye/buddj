import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import TypeormTrackedSpendingRepository from "../../../../../providers/persistence/repositories/TrackedSpendingRepository.js";
import TypeormMonthRepository from "../../../../../providers/persistence/repositories/MonthRepository.js";
import { TrackedSpendingDao } from "../../../../../providers/persistence/entities/TrackedSpending.js";
import TrackedSpending, {
  TrackedSpendingKind,
} from "../../../../../core/models/spending-tracker/TrackedSpending.js";
import IdProvider from "../../../../../providers/IdProvider.js";
import { insertUnarchivedMonth } from "../../../../utils/persistence/seeds/MonthSeeds.js";

const idProvider = new IdProvider();

function trackedSpending(
  props: Partial<{
    kind: TrackedSpendingKind;
    sourceId: string;
    label: string;
    amount: number;
    occurredAt: Date;
  }> = {}
) {
  return new TrackedSpending({
    id: idProvider.get(),
    kind: props.kind ?? "expense",
    sourceId: props.sourceId ?? idProvider.get(),
    label: props.label ?? "Courses",
    amount: props.amount ?? 42.1,
    occurredAt: props.occurredAt ?? new Date("2026-11-13T08:30:00.000Z"),
  });
}

describe("Integration | Providers | Persistence | Repositories | TrackedSpendingRepository", function () {
  const repository = new TypeormTrackedSpendingRepository();

  afterEach(async () => {
    await clearDB();
  });

  describe("#save", () => {
    it("should persist the tracked spending", async () => {
      // given
      const spending = trackedSpending({ amount: 699.41 });

      // when
      await repository.save(spending);

      // then
      const persisted = (
        await TrackedSpendingDao.findOneByOrFail({ id: spending.id })
      ).toDomain();
      expect(persisted).to.deep.equal(spending);
    });

    it("should ignore a second spending for the same source", async () => {
      // given
      const sourceId = idProvider.get();
      await repository.save(trackedSpending({ sourceId, label: "first" }));

      // when
      await repository.save(trackedSpending({ sourceId, label: "second" }));

      // then
      const persisted = await TrackedSpendingDao.findBy({ sourceId });
      expect(persisted.map((dao) => dao.label)).to.deep.equal(["first"]);
    });

    it("should allow the same source id for different kinds", async () => {
      // given
      const sourceId = idProvider.get();

      // when
      await repository.save(trackedSpending({ sourceId, kind: "expense" }));
      await repository.save(trackedSpending({ sourceId, kind: "outflow" }));

      // then
      expect(await TrackedSpendingDao.countBy({ sourceId })).to.equal(2);
    });
  });

  describe("#deleteBySource", () => {
    it("should only delete the spending of the given kind and source", async () => {
      // given
      const sourceId = idProvider.get();
      const expense = trackedSpending({ sourceId, kind: "expense" });
      const outflow = trackedSpending({ sourceId, kind: "outflow" });
      const other = trackedSpending({ kind: "expense" });
      await repository.save(expense);
      await repository.save(outflow);
      await repository.save(other);

      // when
      await repository.deleteBySource("expense", sourceId);

      // then
      const remaining = await TrackedSpendingDao.find();
      expect(remaining.map((dao) => dao.id)).to.have.members([
        outflow.id,
        other.id,
      ]);
    });

    it("should not fail when nothing matches", async () => {
      await expect(repository.deleteBySource("outflow", idProvider.get())).to
        .be.fulfilled;
    });
  });

  describe("#findBetween", () => {
    it("should return the spendings in [from, to[ ordered by date", async () => {
      // given
      const from = new Date("2026-11-01T23:00:00.000Z");
      const to = new Date("2026-11-08T23:00:00.000Z");
      const before = trackedSpending({
        occurredAt: new Date("2026-11-01T22:59:59.999Z"),
      });
      const atFrom = trackedSpending({ occurredAt: from });
      const inside = trackedSpending({
        occurredAt: new Date("2026-11-05T12:00:00.000Z"),
      });
      const atTo = trackedSpending({ occurredAt: to });
      for (const spending of [inside, atTo, before, atFrom]) {
        await repository.save(spending);
      }

      // when
      const found = await repository.findBetween(from, to);

      // then
      expect(found).to.deep.equal([atFrom, inside]);
    });
  });

  describe("survival", () => {
    it("should keep tracked spendings when their month is deleted", async () => {
      // given
      const month = (await insertUnarchivedMonth()).toDomain();
      const [outflow] = month.account.outflows;
      const spending = trackedSpending({
        kind: "outflow",
        sourceId: outflow.id,
      });
      await repository.save(spending);

      // when
      await new TypeormMonthRepository().delete(month);

      // then
      expect(await TrackedSpendingDao.findOneBy({ id: spending.id })).not.to.be
        .null;
    });
  });
});
