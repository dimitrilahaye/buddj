import { beforeEach } from "mocha";
import expect from "../../../../test-helpers.js";
import UntrackSpending from "../../../../../core/usecases/spending-tracker/UntrackSpending.js";
import {
  resetStubs,
  trackedSpendingRepositoryStub,
} from "../test-helpers.js";

describe("Unit | Core | Usecases | UntrackSpending", function () {
  beforeEach(() => {
    resetStubs();
  });

  it("should delete the tracked spending of the given source", async function () {
    // given
    const usecase = new UntrackSpending(trackedSpendingRepositoryStub);

    // when
    await usecase.execute({ kind: "outflow", sourceId: "outflow-id" });

    // then
    expect(
      trackedSpendingRepositoryStub.deleteBySource
    ).to.have.been.calledOnceWithExactly("outflow", "outflow-id");
  });
});
