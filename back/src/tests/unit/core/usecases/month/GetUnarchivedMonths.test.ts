import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import GetUnarchivedMonths from "../../../../../core/usecases/month/GetUnarchivedMonths.js";
import { monthRepositoryStub } from "../test-helpers.js";

describe("Unit | Core | Usecases | GetUnarchivedMonths", function () {
  it("should return all the unarchived months", async function () {
    // given
    const foundUnarchivedMonths = Symbol("foundUnarchivedMonths");
    monthRepositoryStub.findAllUnarchived.resolves(foundUnarchivedMonths);

    const usecase = new GetUnarchivedMonths(monthRepositoryStub);

    // when
    const unarchivedMonths = await usecase.execute();

    // then
    sinon.assert.calledOnce(monthRepositoryStub.findAllUnarchived);
    expect(unarchivedMonths).to.be.equal(foundUnarchivedMonths);
  });
});
