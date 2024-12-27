import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import RemoveBudget, {
  RemoveBudgetCommand,
} from "../../../../../core/usecases/month/RemoveBudget.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub } from "../test-helpers.js";

describe("Unit | Core | Usecases | RemoveBudget", function () {
  it("should return the updated month", async function () {
    // given
    const command: RemoveBudgetCommand = {
      monthId: "month-id",
      budgetId: "budget-id",
    };
    const month = {
      removeBudget: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);
    const usecase = new RemoveBudget(monthRepositoryStub);

    // when
    const updatedMonth = await usecase.execute(command);

    // then
    expect(month.removeBudget.calledOnceWithExactly(command.budgetId)).to.be
      .true;
    expect(
      monthRepositoryStub.removeBudget.calledOnceWithExactly(command.budgetId)
    ).to.be.true;
    expect(updatedMonth).to.deep.equal(month);
  });

  it("should throw an error when month does not exist for given monthId", async function () {
    // given
    const command: RemoveBudgetCommand = {
      monthId: "month-id",
      budgetId: "budget-id",
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new RemoveBudget(monthRepositoryStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
  });
});
