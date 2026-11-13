import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import DeleteOutflowCommand from "../../../../../core/commands/DeleteOutflowCommand.js";
import DeleteOutflow from "../../../../../core/usecases/month/DeleteOutflow.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { beforeEach } from "mocha";
import {
  eventPublisherStub,
  monthRepositoryStub,
  resetStubs,
} from "../test-helpers.js";

describe("Unit | Core | Usecases | DeleteOutflow", function () {
  beforeEach(() => {
    resetStubs();
  });

  it("should return the month after outflow deletion", async function () {
    // given
    const command: DeleteOutflowCommand = {
      monthId: "uuid",
      outflowId: "uuid",
    };

    const foundMonth = {
      deleteOutflow: sinon.stub(),
    };
    monthRepositoryStub.getById.withArgs(command.monthId).resolves(foundMonth);

    const usecase = new DeleteOutflow(monthRepositoryStub, eventPublisherStub);

    // when
    const month = await usecase.execute(command);

    // then
    expect(foundMonth.deleteOutflow).to.have.been.calledOnceWith(
      command.outflowId
    );
    expect(monthRepositoryStub.deleteOutflow).to.have.been.calledOnceWith(
      command.outflowId
    );
    expect(eventPublisherStub.publish).to.have.been.calledOnceWithExactly(
      "outflowDeleted",
      { outflowId: command.outflowId }
    );
    expect(month).to.deep.equal(foundMonth);
  });
  it("should throw an error if month is not found", async function () {
    // given
    const command: DeleteOutflowCommand = {
      monthId: "uuid",
      outflowId: "uuid",
    };

    monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

    const usecase = new DeleteOutflow(monthRepositoryStub, eventPublisherStub);

    // when / then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      MonthNotFoundError
    );
    expect(eventPublisherStub.publish).not.to.have.been.called;
  });
});
