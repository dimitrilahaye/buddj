import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import AddOutflow from "../../../../../core/usecases/month/AddOutflow.js";
import AddOutflowCommand from "../../../../../core/commands/AddOutflowCommand.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { afterEach, beforeEach } from "mocha";
import {
  eventPublisherStub,
  monthRepositoryStub,
  resetStubs,
} from "../test-helpers.js";
import { Clock } from "../../../../test-helpers.js";

describe("Unit | Core | Usecases | AddOutflow", function () {
  const clock = new Clock();
  const now = new Date("2026-11-13T08:30:00.000Z");

  beforeEach(() => {
    resetStubs();
    clock.start(now);
  });

  afterEach(() => {
    clock.restore();
  });

  it("should return a new added outflow without tracking it", async function () {
    // given
    const command: AddOutflowCommand = {
      monthId: "month-id",
      label: "JOW",
      amount: 10,
    };

    const outflowFactory = {
      idProvider: { get: sinon.stub() },
      create: sinon.stub(),
    };
    const outflow = { id: "outflow-id", label: "JOW", amount: 10 };
    outflowFactory.create.returns(outflow);

    const month = {
      addOutflow: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);

    const usecase = new AddOutflow(outflowFactory, monthRepositoryStub);

    // when
    const updatedMonth = await usecase.execute(command);

    // then
    expect(
      outflowFactory.create.calledOnceWithExactly({
        label: command.label,
        amount: command.amount,
      })
    ).to.be.true;
    expect(month.addOutflow.calledOnceWithExactly(outflow)).to.be.true;
    expect(monthRepositoryStub.addOutflow.calledOnceWithExactly(month, outflow))
      .to.be.true;
    expect(eventPublisherStub.publish).not.to.have.been.called;
    expect(updatedMonth).to.deep.equal(month);
  });

  it("should throw an error if month does not exist for given monthId", async function () {
    // given
    const command: AddOutflowCommand = {
      monthId: "month-id",
      label: "JOW",
      amount: 10,
    };

    const outflowFactory = {
      idProvider: { get: sinon.stub() },
      create: sinon.stub(),
    };
    const outflow = Symbol("outflow");
    outflowFactory.create.returns(outflow);

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new AddOutflow(outflowFactory, monthRepositoryStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
    expect(eventPublisherStub.publish).not.to.have.been.called;
  });
});
