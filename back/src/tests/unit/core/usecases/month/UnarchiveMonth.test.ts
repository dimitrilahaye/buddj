import { beforeEach } from "mocha";
import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import UnarchiveMonthCommand from "../../../../../core/commands/UnarchiveMonthCommand.js";
import UnarchiveMonth from "../../../../../core/usecases/month/UnarchiveMonth.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub, resetStubs } from "../test-helpers.js";

describe("Unit | Core | Usecases | UnarchiveMonth", function () {
  beforeEach(() => {
    resetStubs();
  });
  it("should return all unarchived months", async function () {
    // given
    const command: UnarchiveMonthCommand = {
      monthId: "month-id",
    };

    const month = {
      unarchive: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);
    const allUnarchivedMonths = Symbol("allUnarchivedMonths");
    monthRepositoryStub.findAllUnarchived.resolves(allUnarchivedMonths);

    const usecase = new UnarchiveMonth(monthRepositoryStub);

    // when
    const result = await usecase.execute(command);

    // then
    expect(month.unarchive.calledOnce).to.be.true;
    expect(monthRepositoryStub.unarchive).to.have.been.calledOnceWith(month);
    expect(monthRepositoryStub.findAllUnarchived).to.have.been.calledOnce;
    expect(result).to.deep.equal(allUnarchivedMonths);
  });
  it("should throw an error if month is not found", async function () {
    // given
    const command: UnarchiveMonthCommand = {
      monthId: "month-id",
    };

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new UnarchiveMonth(monthRepositoryStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
  });
});
