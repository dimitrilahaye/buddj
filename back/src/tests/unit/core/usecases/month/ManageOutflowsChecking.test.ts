import expect from "../../../../test-helpers.js";
import { Clock } from "../../../../test-helpers.js";
import { afterEach, beforeEach } from "mocha";
import ManageOutflowsCheckingCommand from "../../../../../core/commands/ManageOutflowsCheckingCommand.js";
import ManageOutflowsChecking from "../../../../../core/usecases/month/ManageOutflowsChecking.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import Month from "../../../../../core/models/month/Month.js";
import Account from "../../../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../../../core/models/month/account/AccountOutflow.js";
import {
  eventPublisherStub,
  monthRepositoryStub,
  resetStubs,
} from "../test-helpers.js";

describe("Unit | Core | Usecases | ManageOutflowsChecking", function () {
  const clock = new Clock();
  const now = new Date("2026-11-21T09:00:00.000Z");

  beforeEach(() => {
    resetStubs();
    monthRepositoryStub.getById.reset();
    clock.start(now);
  });

  afterEach(() => {
    clock.restore();
  });

  function buildMonth() {
    return new Month({
      id: "month-id",
      date: new Date("2026-11-01"),
      account: new Account({
        id: "account-id",
        currentBalance: 1000,
        weeklyBudgets: [],
        outflows: [
          new AccountOutflow({ id: "to-check", label: "EDF", amount: 114.62 }),
          new AccountOutflow({
            id: "to-uncheck",
            label: "Loyer",
            amount: 800,
            isChecked: true,
          }),
          new AccountOutflow({
            id: "stays-checked",
            label: "Box",
            amount: 30,
            isChecked: true,
          }),
          new AccountOutflow({ id: "stays-unchecked", label: "Gym", amount: 25 }),
        ],
      }),
    });
  }

  it("should return an up to date Month", async function () {
    // given
    const month = buildMonth();
    const command: ManageOutflowsCheckingCommand = {
      monthId: "month-id",
      currentBalance: 2000,
      outflows: [
        { id: "to-check", isChecked: true },
        { id: "to-uncheck", isChecked: false },
      ],
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);
    const usecase = new ManageOutflowsChecking(
      monthRepositoryStub,
      eventPublisherStub
    );

    // when
    const updatedMonth = await usecase.execute(command);

    // then
    expect(updatedMonth.account.currentBalance).to.equal(2000);
    expect(updatedMonth.findOutflow("to-check").isChecked).to.be.true;
    expect(updatedMonth.findOutflow("to-uncheck").isChecked).to.be.false;
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
  });

  it("should publish outflowChecked and outflowUnchecked only for outflows whose state changes", async function () {
    // given
    const month = buildMonth();
    const command: ManageOutflowsCheckingCommand = {
      monthId: "month-id",
      currentBalance: 1000,
      outflows: [
        { id: "to-check", isChecked: true },
        { id: "to-uncheck", isChecked: false },
        { id: "stays-checked", isChecked: true },
        { id: "stays-unchecked", isChecked: false },
      ],
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);
    const usecase = new ManageOutflowsChecking(
      monthRepositoryStub,
      eventPublisherStub
    );

    // when
    await usecase.execute(command);

    // then
    expect(eventPublisherStub.publish).to.have.been.calledTwice;
    expect(eventPublisherStub.publish).to.have.been.calledWith(
      "outflowChecked",
      {
        outflowId: "to-check",
        label: "EDF",
        amount: 114.62,
        occurredAt: now,
      }
    );
    expect(eventPublisherStub.publish).to.have.been.calledWith(
      "outflowUnchecked",
      { outflowId: "to-uncheck" }
    );
    expect(eventPublisherStub.publish).to.have.been.calledAfter(
      monthRepositoryStub.manageOutflowsChecking
    );
  });

  it("should throw an error if month is not found", async function () {
    // given
    const command: ManageOutflowsCheckingCommand = {
      monthId: "month-id",
      currentBalance: 2000,
      outflows: [{ id: "uuid", isChecked: true }],
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);
    const usecase = new ManageOutflowsChecking(
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
