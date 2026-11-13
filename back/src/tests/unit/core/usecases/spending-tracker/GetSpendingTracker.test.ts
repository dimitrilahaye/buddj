import { beforeEach } from "mocha";
import expect from "../../../../test-helpers.js";
import GetSpendingTracker from "../../../../../core/usecases/spending-tracker/GetSpendingTracker.js";
import TrackedSpending, {
  TrackedSpendingKind,
} from "../../../../../core/models/spending-tracker/TrackedSpending.js";
import { SpendingTrackerRangeError } from "../../../../../core/errors/SpendingTrackerErrors.js";
import {
  resetStubs,
  trackedSpendingRepositoryStub,
} from "../test-helpers.js";

function spending(
  id: string,
  kind: TrackedSpendingKind,
  amount: number,
  occurredAt: string
) {
  return new TrackedSpending({
    id,
    kind,
    sourceId: `${id}-source`,
    label: id,
    amount,
    occurredAt: new Date(occurredAt),
  });
}

describe("Unit | Core | Usecases | GetSpendingTracker", function () {
  let usecase: GetSpendingTracker;

  beforeEach(() => {
    resetStubs();
    usecase = new GetSpendingTracker(trackedSpendingRepositoryStub);
  });

  it("should query the repository from Paris midnight of `from` to Paris midnight after `to`", async function () {
    // given
    trackedSpendingRepositoryStub.findBetween.resolves([]);

    // when
    await usecase.execute({
      granularity: "day",
      from: "2026-11-02",
      to: "2026-11-08",
    });

    // then (heure d'hiver : UTC+1)
    expect(
      trackedSpendingRepositoryStub.findBetween
    ).to.have.been.calledOnceWithExactly(
      new Date("2026-11-01T23:00:00.000Z"),
      new Date("2026-11-08T23:00:00.000Z")
    );
  });

  it("should take summer time into account for the queried range", async function () {
    // given
    trackedSpendingRepositoryStub.findBetween.resolves([]);

    // when
    await usecase.execute({
      granularity: "day",
      from: "2026-07-01",
      to: "2026-07-01",
    });

    // then (heure d'été : UTC+2)
    expect(
      trackedSpendingRepositoryStub.findBetween
    ).to.have.been.calledOnceWithExactly(
      new Date("2026-06-30T22:00:00.000Z"),
      new Date("2026-07-01T22:00:00.000Z")
    );
  });

  it("should group by Paris day, including empty days, with totals per kind", async function () {
    // given
    trackedSpendingRepositoryStub.findBetween.resolves([
      spending("courses", "expense", 42.1, "2026-11-02T10:00:00.000Z"),
      spending("loyer", "outflow", 699.41, "2026-11-02T12:00:00.000Z"),
      // 23h30 UTC le 3 = 00h30 à Paris le 4
      spending("kebab", "expense", 12, "2026-11-03T23:30:00.000Z"),
    ]);

    // when
    const tracker = await usecase.execute({
      granularity: "day",
      from: "2026-11-02",
      to: "2026-11-04",
    });

    // then
    expect(tracker.buckets.map((b) => b.start)).to.deep.equal([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
    ]);
    expect(tracker.buckets[0]).to.include({
      total: 741.51,
      expensesTotal: 42.1,
      outflowsTotal: 699.41,
    });
    expect(tracker.buckets[1]).to.include({
      total: 0,
      expensesTotal: 0,
      outflowsTotal: 0,
    });
    expect(tracker.buckets[1].entries).to.deep.equal([]);
    expect(tracker.buckets[2].entries.map((e) => e.id)).to.deep.equal([
      "kebab",
    ]);
    expect(tracker).to.include({
      granularity: "day",
      from: "2026-11-02",
      to: "2026-11-04",
      total: 753.51,
      expensesTotal: 54.1,
      outflowsTotal: 699.41,
    });
  });

  it("should sort the entries of a bucket by descending amount", async function () {
    // given
    trackedSpendingRepositoryStub.findBetween.resolves([
      spending("petit", "expense", 3, "2026-11-02T08:00:00.000Z"),
      spending("gros", "outflow", 300, "2026-11-02T09:00:00.000Z"),
      spending("moyen", "expense", 30, "2026-11-02T10:00:00.000Z"),
    ]);

    // when
    const tracker = await usecase.execute({
      granularity: "day",
      from: "2026-11-02",
      to: "2026-11-02",
    });

    // then
    expect(tracker.buckets[0].entries.map((e) => e.id)).to.deep.equal([
      "gros",
      "moyen",
      "petit",
    ]);
  });

  it("should group by week starting on Monday", async function () {
    // given (le 2026-11-08 est un dimanche, le 2026-11-09 un lundi)
    trackedSpendingRepositoryStub.findBetween.resolves([
      spending("dimanche", "expense", 10, "2026-11-08T12:00:00.000Z"),
      spending("lundi", "expense", 20, "2026-11-09T12:00:00.000Z"),
    ]);

    // when
    const tracker = await usecase.execute({
      granularity: "week",
      from: "2026-11-04",
      to: "2026-11-12",
    });

    // then
    expect(
      tracker.buckets.map(({ start, total }) => ({ start, total }))
    ).to.deep.equal([
      { start: "2026-11-02", total: 10 },
      { start: "2026-11-09", total: 20 },
    ]);
  });

  it("should group by month", async function () {
    // given
    trackedSpendingRepositoryStub.findBetween.resolves([
      spending("septembre", "outflow", 100, "2026-09-15T12:00:00.000Z"),
      // 31 octobre 23h30 UTC = 1er novembre 00h30 à Paris
      spending("novembre", "expense", 50, "2026-10-31T23:30:00.000Z"),
    ]);

    // when
    const tracker = await usecase.execute({
      granularity: "month",
      from: "2026-09-10",
      to: "2026-11-13",
    });

    // then
    expect(
      tracker.buckets.map(({ start, total }) => ({ start, total }))
    ).to.deep.equal([
      { start: "2026-09-01", total: 100 },
      { start: "2026-10-01", total: 0 },
      { start: "2026-11-01", total: 50 },
    ]);
  });

  it("should reject a range whose start is after its end", async function () {
    // when / then
    await expect(
      usecase.execute({
        granularity: "day",
        from: "2026-11-13",
        to: "2026-11-01",
      })
    ).to.be.rejectedWith(SpendingTrackerRangeError);
    expect(trackedSpendingRepositoryStub.findBetween).not.to.have.been.called;
  });
});
