import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import UpdateExpenseCommand from "../../../../../core/commands/UpdateExpenseCommand.js";
import UpdateExpense from "../../../../../core/usecases/month/UpdateExpense.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { beforeEach } from "mocha";
import {
  eventPublisherStub,
  monthRepositoryStub,
  resetStubs,
} from "../test-helpers.js";

describe("Unit | Core | Usecases | UpdateExpense", function () {
  beforeEach(() => {
    resetStubs();
  });

  it("should update the expense and return the updated month", async function () {
    // given
    const command: UpdateExpenseCommand = {
      monthId: "uuid",
      originalWeeklyId: "uuid",
      newWeeklyId: "uuid",
      expenseId: "uuid",
      label: "JOW",
      amount: 10,
    };

    const foundMonth = {
      updateExpenseAmountFromWeeklyBudget: sinon.stub(),
      updateExpenseLabelFromWeeklyBudget: sinon.stub(),
      updateExpenseWeeklyBudget: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(foundMonth);
    const persistedMonth = Symbol("persistedMonth");
    monthRepositoryStub.save.withArgs(foundMonth).resolves(persistedMonth);

    const usecase = new UpdateExpense(monthRepositoryStub, eventPublisherStub);

    // when
    const month = await usecase.execute(command);

    // then
    expect(
      foundMonth.updateExpenseAmountFromWeeklyBudget
    ).to.have.been.calledOnceWith(
      command.originalWeeklyId,
      command.expenseId,
      command.amount
    );
    expect(
      foundMonth.updateExpenseLabelFromWeeklyBudget
    ).to.have.been.calledOnceWith(
      command.originalWeeklyId,
      command.expenseId,
      command.label
    );
    expect(foundMonth.updateExpenseWeeklyBudget).to.have.been.calledOnceWith(
      command.originalWeeklyId,
      command.newWeeklyId,
      command.expenseId
    );
    expect(month).to.deep.equal(persistedMonth);
    expect(eventPublisherStub.publish).to.have.been.calledOnceWithExactly(
      "expenseUpdated",
      { expenseId: command.expenseId, label: command.label, amount: command.amount }
    );
  });
  it("should throw an error if month does not exist", async function () {
    // given
    const command: UpdateExpenseCommand = {
      monthId: "uuid",
      originalWeeklyId: "uuid",
      newWeeklyId: "uuid",
      expenseId: "uuid",
      label: "JOW",
      amount: 10,
    };

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new UpdateExpense(monthRepositoryStub, eventPublisherStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
    expect(eventPublisherStub.publish).to.not.have.been.called;
  });
});
