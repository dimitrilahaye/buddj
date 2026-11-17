import sinon from "sinon";
import { beforeEach } from "mocha";
import expect from "../../../../test-helpers.js";
import UpdateOutflow, {
  UpdateOutflowCommand,
} from "../../../../../core/usecases/month/UpdateOutflow.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import {
  eventPublisherStub,
  monthRepositoryStub,
  resetStubs,
} from "../test-helpers.js";

describe("Unit | Core | Usecases | UpdateOutflow", function () {
  const command: UpdateOutflowCommand = {
    monthId: "month-id",
    outflowId: "outflow-id",
    label: "Engie",
    amount: 90,
  };

  beforeEach(() => {
    resetStubs();
  });

  it("should update the outflow, persist it and publish an event", async function () {
    // given
    const outflow = { id: "outflow-id", label: "Engie", amount: 90 };
    const month = { updateOutflow: sinon.stub().returns(outflow) };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);
    const usecase = new UpdateOutflow(monthRepositoryStub, eventPublisherStub);

    // when
    const updatedMonth = await usecase.execute(command);

    // then
    expect(month.updateOutflow).to.have.been.calledOnceWithExactly(
      command.outflowId,
      command.label,
      command.amount
    );
    expect(monthRepositoryStub.updateOutflow).to.have.been.calledOnceWithExactly(
      outflow
    );
    expect(eventPublisherStub.publish).to.have.been.calledOnceWithExactly(
      "outflowUpdated",
      { outflowId: "outflow-id", label: "Engie", amount: 90 }
    );
    expect(updatedMonth).to.equal(month);
  });

  it("should throw if month does not exist", async function () {
    // given
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);
    const usecase = new UpdateOutflow(monthRepositoryStub, eventPublisherStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
    expect(eventPublisherStub.publish).to.not.have.been.called;
  });
});
