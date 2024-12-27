import { beforeEach } from "mocha";
import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import DeleteExpenseCommand from "../../../../../core/commands/DeleteExpenseCommand.js";
import DeleteExpense from "../../../../../core/usecases/month/DeleteExpense.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub, resetStubs } from "../test-helpers.js";

describe("Unit | Core | Usecases | DeleteExpense", function () {
  beforeEach(() => {
    resetStubs();
  });
  it("should return the month after expense deletion", async function () {
    // given
    const command: DeleteExpenseCommand = {
      monthId: "uuid",
      weeklyId: "uuid",
      expenseId: "uuid",
    };

    const foundMonth = {
      deleteExpenseFromWeeklyBudget: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(foundMonth);

    const usecase = new DeleteExpense(monthRepositoryStub);

    // when
    const month = await usecase.execute(command);

    // then
    expect(
      foundMonth.deleteExpenseFromWeeklyBudget
    ).to.have.been.calledOnceWith(command.weeklyId, command.expenseId);
    expect(monthRepositoryStub.deleteExpense).to.have.been.calledOnceWith(
      command.expenseId
    );
    expect(
      monthRepositoryStub.updateWeeklyBudgetCurrentBalance
    ).to.have.been.calledOnceWith(foundMonth, command.weeklyId);
    expect(month).to.deep.equal(foundMonth);
  });
  it("should throw an error if month is not found", async function () {
    // given
    const command: DeleteExpenseCommand = {
      monthId: "uuid",
      weeklyId: "uuid",
      expenseId: "uuid",
    };

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new DeleteExpense(monthRepositoryStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
  });
});
