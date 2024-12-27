import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import AddBudget, {
  AddBudgetCommand,
} from "../../../../../core/usecases/month/AddBudget.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub } from "../test-helpers.js";

describe("Unit | Core | Usecases | AddBudget", function () {
  it("should return a new added budget", async function () {
    // given
    const command: AddBudgetCommand = {
      monthId: "month-id",
      name: "Vacances",
      initialBalance: 100,
    };

    const budgetFactory = {
      idProvider: { get: sinon.stub() },
      create: sinon.stub(),
    };
    const budget = Symbol("budget");
    budgetFactory.create.returns(budget);

    const month = {
      addBudget: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);

    const usecase = new AddBudget(budgetFactory, monthRepositoryStub);

    // when
    const updatedMonth = await usecase.execute(command);

    // then
    expect(
      budgetFactory.create.calledOnceWithExactly({
        name: command.name,
        initialBalance: command.initialBalance,
      })
    ).to.be.true;
    expect(month.addBudget.calledOnceWithExactly(budget)).to.be.true;
    expect(monthRepositoryStub.addBudget.calledOnceWithExactly(month, budget))
      .to.be.true;
    expect(updatedMonth).to.deep.equal(month);
  });

  it("should throw an error budget month does not exist for given monthId", async function () {
    // given
    const command: AddBudgetCommand = {
      monthId: "month-id",
      name: "Vacances",
      initialBalance: 100,
    };

    const budgetFactory = {
      idProvider: { get: sinon.stub() },
      create: sinon.stub(),
    };
    const budget = Symbol("budget");
    budgetFactory.create.returns(budget);

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new AddBudget(budgetFactory, monthRepositoryStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
  });
});
