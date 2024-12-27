import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import ManageExpensesCheckingCommand from "../../../../../core/commands/ManageExpensesCheckingCommand.js";
import ManageExpensesChecking from "../../../../../core/usecases/month/ManageExpensesChecking.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub } from "../test-helpers.js";

describe("Unit | Core | Usecases | ManageExpensesChecking", function () {
  it("should return an up to date Month", async function () {
    // given
    const weeklyIdForCheck = "weekly-1";
    const expenseIdForCheck = "expense-1";
    const weeklyIdForUncheck = "weekly-2";
    const expenseIdForUncheck = "expense-2";
    const command: ManageExpensesCheckingCommand = {
      monthId: "month-id",
      weeklyBudgets: [
        {
          id: weeklyIdForUncheck,
          expenses: [
            {
              id: expenseIdForUncheck,
              isChecked: false,
            },
          ],
        },
        {
          id: weeklyIdForCheck,
          expenses: [
            {
              id: expenseIdForCheck,
              isChecked: true,
            },
          ],
        },
      ],
    };

    const month = {
      checkExpense: sinon.stub(),
      uncheckExpense: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);

    const usecase = new ManageExpensesChecking(monthRepositoryStub);

    // when
    const updatedMonth = await usecase.execute(command);

    // then
    expect(
      month.uncheckExpense.calledOnceWithExactly(
        weeklyIdForUncheck,
        expenseIdForUncheck
      )
    ).to.be.true;
    expect(
      month.checkExpense.calledOnceWithExactly(
        weeklyIdForCheck,
        expenseIdForCheck
      )
    ).to.be.true;
    expect(
      monthRepositoryStub.manageExpensesChecking.calledOnceWithExactly(
        month,
        command.weeklyBudgets
      )
    ).to.be.true;
    for (const { id } of command.weeklyBudgets) {
      expect(
        monthRepositoryStub.updateWeeklyBudgetCurrentBalance.calledWith(
          month,
          id
        )
      ).to.be.true;
    }
    expect(updatedMonth).to.deep.equal(month);
  });
  it("should throw an error if month is not found", async function () {
    // given
    const command: ManageExpensesCheckingCommand = {
      monthId: "month-id",
      weeklyBudgets: [
        {
          id: "uuid",
          expenses: [
            {
              id: "uuid",
              isChecked: false,
            },
          ],
        },
        {
          id: "uuid",
          expenses: [
            {
              id: "uuid",
              isChecked: true,
            },
          ],
        },
      ],
    };

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new ManageExpensesChecking(monthRepositoryStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
  });
});
