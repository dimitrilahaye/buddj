import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import AddWeeklyExpense from "../../../../../core/usecases/month/AddWeeklyExpense.js";
import AddWeeklyExpenseCommand from "../../../../../core/commands/AddWeeklyExpenseCommand.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { beforeEach } from "mocha";
import {
  eventPublisherStub,
  monthRepositoryStub,
  resetStubs,
} from "../test-helpers.js";

describe("Unit | Core | Usecases | AddWeeklyExpense", function () {
  beforeEach(() => {
    resetStubs();
  });

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
    const expense = {
      id: "expense-id",
      label: "JOW",
      amount: 10,
      date: new Date("2026-11-13T08:30:00.000Z"),
    };
    weeklyExpenseFactory.create.returns(expense);

    const month = {
      addExpenseToWeeklyBudget: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);

    const usecase = new AddWeeklyExpense(
      weeklyExpenseFactory,
      monthRepositoryStub,
      eventPublisherStub
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
    expect(eventPublisherStub.publish).to.have.been.calledOnceWithExactly(
      "expenseAdded",
      {
        expenseId: "expense-id",
        label: "JOW",
        amount: 10,
        occurredAt: expense.date,
      }
    );
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
      monthRepositoryStub,
      eventPublisherStub
    );

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
    expect(eventPublisherStub.publish).not.to.have.been.called;
  });
});
