import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import IdProvider from "../../../../../providers/IdProvider.js";
import TypeormTrackedSpendingRepository from "../../../../../providers/persistence/repositories/TrackedSpendingRepository.js";
import { TrackedSpendingDao } from "../../../../../providers/persistence/entities/TrackedSpending.js";
import TrackedSpending from "../../../../../core/models/spending-tracker/TrackedSpending.js";

const idProvider = new IdProvider();

describe("Integration | Providers | Persistence | Repositories | TrackedSpendingRepository | update", function () {
  afterEach(async () => {
    await clearDB();
  });

  describe("TrackedSpendingRepository#updateBySource", () => {
    it("should update label and amount of the matching entry only", async () => {
      // given
      const repository = new TypeormTrackedSpendingRepository();
      const sourceId = idProvider.get();
      const occurredAt = new Date("2026-11-13T08:30:00.000Z");
      const tracked = new TrackedSpending({
        id: idProvider.get(),
        kind: "expense",
        sourceId,
        label: "Courses",
        amount: 10,
        occurredAt,
      });
      const other = new TrackedSpending({
        id: idProvider.get(),
        kind: "outflow",
        sourceId,
        label: "EDF",
        amount: 50,
        occurredAt,
      });
      await repository.save(tracked);
      await repository.save(other);

      // when
      await repository.updateBySource("expense", sourceId, {
        label: "Courses bio",
        amount: 12.3,
      });

      // then
      const persisted = (
        await TrackedSpendingDao.findOneByOrFail({ id: tracked.id })
      ).toDomain();
      expect(persisted.label).to.equal("Courses bio");
      expect(persisted.amount).to.equal(12.3);
      expect(persisted.occurredAt).to.deep.equal(occurredAt);
      const untouched = (
        await TrackedSpendingDao.findOneByOrFail({ id: other.id })
      ).toDomain();
      expect(untouched).to.deep.equal(other);
    });

    it("should do nothing when the source is not tracked", async () => {
      const repository = new TypeormTrackedSpendingRepository();

      await repository.updateBySource("expense", idProvider.get(), {
        label: "X",
        amount: 1,
      });

      expect(await TrackedSpendingDao.count()).to.equal(0);
    });
  });
});
