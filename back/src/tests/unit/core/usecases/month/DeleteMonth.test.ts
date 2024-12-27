import expect from "../../../../test-helpers.js";
import DeleteMonthCommand from "../../../../../core/commands/DeleteMonthCommand.js";
import DeleteMonth from "../../../../../core/usecases/month/DeleteMonth.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub } from "../test-helpers.js";

describe("Unit | Core | Usecases | DeleteMonth", function () {
  it("should delete the month and return all archived months", async function () {
    // given
    const command: DeleteMonthCommand = {
      monthId: "month-id",
    };

    const month = Symbol("month");
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);
    const allArchivedMonths = Symbol("allArchivedMonths");
    monthRepositoryStub.findAllArchived.resolves(allArchivedMonths);

    const usecase = new DeleteMonth(monthRepositoryStub);

    // when
    const result = await usecase.execute(command);

    // then
    expect(monthRepositoryStub.delete).to.have.been.calledOnceWith(month);
    expect(monthRepositoryStub.findAllArchived).to.have.been.calledOnce;
    expect(result).to.deep.equal(allArchivedMonths);
  });
  it("should throw an error if month is not found", async function () {
    // given
    const command: DeleteMonthCommand = {
      monthId: "month-id",
    };

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new DeleteMonth(monthRepositoryStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
  });
});
