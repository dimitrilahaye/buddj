import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import ManageOutflowsCheckingCommand from "../../../../../core/commands/ManageOutflowsCheckingCommand.js";
import ManageOutflowsChecking from "../../../../../core/usecases/month/ManageOutflowsChecking.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { monthRepositoryStub } from "../test-helpers.js";

describe("Unit | Core | Usecases | ManageOutflowsChecking", function () {
  it("should return an up to date Month", async function () {
    // given
    const outflowIdForCheck = "outflow-1";
    const outflowIdForUncheck = "outflow-2";
    const command: ManageOutflowsCheckingCommand = {
      monthId: "month-id",
      currentBalance: 2000,
      outflows: [
        {
          id: outflowIdForUncheck,
          isChecked: false,
        },
        {
          id: outflowIdForCheck,
          isChecked: true,
        },
      ],
    };

    const month = {
      checkOutflow: sinon.stub(),
      uncheckOutflow: sinon.stub(),
      updateAccountCurrentBalance: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);

    const usecase = new ManageOutflowsChecking(monthRepositoryStub);

    // when
    const updatedMonth = await usecase.execute(command);

    // then
    expect(
      month.updateAccountCurrentBalance.calledOnceWithExactly(
        command.currentBalance
      )
    ).to.be.true;
    expect(month.checkOutflow.calledOnceWithExactly(outflowIdForCheck)).to.be
      .true;
    expect(month.checkOutflow.calledOnceWithExactly(outflowIdForCheck)).to.be
      .true;
    expect(
      monthRepositoryStub.updateAccountCurrentBalance.calledOnceWithExactly(
        month
      )
    ).to.be.true;
    expect(
      monthRepositoryStub.manageOutflowsChecking.calledOnceWithExactly(
        command.outflows
      )
    ).to.be.true;
    expect(updatedMonth).to.deep.equal(month);
  });
  it("should throw an error if month is not found", async function () {
    // given
    const command: ManageOutflowsCheckingCommand = {
      monthId: "month-id",
      currentBalance: 2000,
      outflows: [
        {
          id: "uuid",
          isChecked: false,
        },
        {
          id: "uuid",
          isChecked: true,
        },
      ],
    };

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new ManageOutflowsChecking(monthRepositoryStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
  });
});
