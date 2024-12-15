import sinon from "sinon";
import expect from "../../../test-helpers.js";
import UpdateBudget, {
  UpdateBudgetCommand,
} from "../../../../core/usecases/UpdateBudget.js";
import { MonthNotFoundError } from "../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub } from "./test-helpers.js";

describe("Unit | Core | Usecases | UpdateBudget", function () {
  it("should update the budget name", async function () {
    // given
    const command: UpdateBudgetCommand = {
      monthId: "month-id",
      name: "Vacances",
      budgetId: "uuid",
    };

    const month = {
      updateBudget: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);

    const usecase = new UpdateBudget(monthRepositoryStub);

    // when
    const updatedMonth = await usecase.execute(command);

    // then
    expect(
      month.updateBudget.calledOnceWithExactly(command.budgetId, command.name)
    ).to.be.true;
    expect(
      monthRepositoryStub.updateBudget.calledOnceWithExactly(
        command.budgetId,
        command.name
      )
    ).to.be.true;
    expect(updatedMonth).to.deep.equal(month);
  });

  it("should throw an error budget month does not exist for given monthId", async function () {
    // given
    const command: UpdateBudgetCommand = {
      monthId: "month-id",
      name: "Vacances",
      budgetId: "uuid",
    };

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new UpdateBudget(monthRepositoryStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
  });
});
