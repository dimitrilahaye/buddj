import { beforeEach } from "mocha";
import expect from "../../../../test-helpers.js";
import GetArchivedMonths from "../../../../../core/usecases/month/GetArchivedMonths.js";
import { resetStubs, monthRepositoryStub } from "../test-helpers.js";

describe("Unit | Core | Usecases | GetArchivedMonths", function () {
  beforeEach(() => {
    resetStubs();
  });
  it("should return all the archived months", async function () {
    // given
    const foundArchivedMonths = Symbol("foundArchivedMonths");
    monthRepositoryStub.findAllArchived.resolves(foundArchivedMonths);

    const usecase = new GetArchivedMonths(monthRepositoryStub);

    // when
    const archivedMonths = await usecase.execute();

    // then
    expect(monthRepositoryStub.findAllArchived).to.have.been.calledOnce;
    expect(archivedMonths).to.be.equal(foundArchivedMonths);
  });
});
