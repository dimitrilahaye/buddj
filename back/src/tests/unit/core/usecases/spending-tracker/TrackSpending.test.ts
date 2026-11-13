import { beforeEach } from "mocha";
import expect from "../../../../test-helpers.js";
import TrackSpending from "../../../../../core/usecases/spending-tracker/TrackSpending.js";
import TrackedSpending from "../../../../../core/models/spending-tracker/TrackedSpending.js";
import {
  idProviderStub,
  resetStubs,
  trackedSpendingRepositoryStub,
} from "../test-helpers.js";

describe("Unit | Core | Usecases | TrackSpending", function () {
  beforeEach(() => {
    resetStubs();
  });

  it("should persist a tracked spending built from the command", async function () {
    // given
    idProviderStub.get.returns("tracked-id");
    const occurredAt = new Date("2026-11-13T08:30:00.000Z");
    const usecase = new TrackSpending(
      idProviderStub,
      trackedSpendingRepositoryStub
    );

    // when
    await usecase.execute({
      kind: "expense",
      sourceId: "expense-id",
      label: "Boulangerie",
      amount: 4.5,
      occurredAt,
    });

    // then
    expect(trackedSpendingRepositoryStub.save).to.have.been.calledOnce;
    const [saved] = trackedSpendingRepositoryStub.save.firstCall.args;
    expect(saved).to.be.instanceOf(TrackedSpending);
    expect(saved).to.deep.equal(
      new TrackedSpending({
        id: "tracked-id",
        kind: "expense",
        sourceId: "expense-id",
        label: "Boulangerie",
        amount: 4.5,
        occurredAt,
      })
    );
  });

  it("should propagate a repository failure", async function () {
    // given
    idProviderStub.get.returns("tracked-id");
    trackedSpendingRepositoryStub.save.rejects(new Error("db down"));
    const usecase = new TrackSpending(
      idProviderStub,
      trackedSpendingRepositoryStub
    );

    // when / then
    await expect(
      usecase.execute({
        kind: "outflow",
        sourceId: "outflow-id",
        label: "EDF",
        amount: 114.62,
        occurredAt: new Date(),
      })
    ).to.be.rejectedWith("db down");
  });
});
