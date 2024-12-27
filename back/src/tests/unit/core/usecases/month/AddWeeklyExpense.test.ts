import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import AddWeeklyExpense from "../../../../../core/usecases/month/AddWeeklyExpense.js";
import AddWeeklyExpenseCommand from "../../../../../core/commands/AddWeeklyExpenseCommand.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub } from "../test-helpers.js";

describe("Unit | Core | Usecases | AddWeeklyExpense", function () {
  it("should return a new added weekly expense", async function () {
    // given
    const command: AddWeeklyExpenseCommand = {
      monthId: "month-id",
      weeklyBudgetId: "budget-id",
      label: "JOW",
      amount: 10,
    };

    const weeklyExpenseFactory = {
      idProvider: { get: sinon.stub() },
      create: sinon.stub(),
    };
    const expense = Symbol("expense");
    weeklyExpenseFactory.create.returns(expense);

    const month = {
      addExpenseToWeeklyBudget: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);

    const usecase = new AddWeeklyExpense(
      weeklyExpenseFactory,
      monthRepositoryStub
    );

    // when
    const updatedMonth = await usecase.execute(command);

    // then
    expect(
      weeklyExpenseFactory.create.calledOnceWithExactly({
        label: command.label,
        amount: command.amount,
      })
    ).to.be.true;
    expect(
      month.addExpenseToWeeklyBudget.calledOnceWithExactly(
        command.weeklyBudgetId,
        expense
      )
    ).to.be.true;
    expect(
      monthRepositoryStub.addExpenseToWeeklyBudget.calledOnceWithExactly(
        month,
        command.weeklyBudgetId,
        expense
      )
    ).to.be.true;
    expect(
      monthRepositoryStub.updateWeeklyBudgetCurrentBalance.calledOnceWithExactly(
        month,
        command.weeklyBudgetId
      )
    ).to.be.true;
    expect(updatedMonth).to.deep.equal(month);
  });

  it("should throw an error if month does not exist for given monthId", async function () {
    // given
    const command: AddWeeklyExpenseCommand = {
      monthId: "month-id",
      weeklyBudgetId: "budget-id",
      label: "JOW",
      amount: 10,
    };

    const weeklyExpenseFactory = {
      idProvider: { get: sinon.stub() },
      create: sinon.stub(),
    };
    const expense = Symbol("expense");
    weeklyExpenseFactory.create.returns(expense);

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new AddWeeklyExpense(
      weeklyExpenseFactory,
      monthRepositoryStub
    );

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
  });
});
