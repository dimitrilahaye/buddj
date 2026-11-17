import { beforeEach } from "mocha";
import expect from "../../../../test-helpers.js";
import UpdateTrackedSpending from "../../../../../core/usecases/spending-tracker/UpdateTrackedSpending.js";
import {
  resetStubs,
  trackedSpendingRepositoryStub,
} from "../test-helpers.js";

describe("Unit | Core | Usecases | UpdateTrackedSpending", function () {
  beforeEach(() => {
    resetStubs();
  });

  it("should update label and amount of the tracked spending of the given source", async function () {
    // given
    const usecase = new UpdateTrackedSpending(trackedSpendingRepositoryStub);

    // when
    await usecase.execute({
      kind: "expense",
      sourceId: "expense-id",
      label: "Courses",
      amount: 12.5,
    });

    // then
    expect(
      trackedSpendingRepositoryStub.updateBySource
    ).to.have.been.calledOnceWithExactly("expense", "expense-id", {
      label: "Courses",
      amount: 12.5,
    });
  });
});
