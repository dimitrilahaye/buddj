import sinon from "sinon";
import expect from "../../../test-helpers.js";
import DeleteOutflowCommand from "../../../../core/commands/DeleteOutflowCommand.js";
import DeleteOutflow from "../../../../core/usecases/DeleteOutflow.js";
import {MonthNotFoundError} from "../../../../core/errors/MonthErrors.js";
import {monthRepositoryStub} from "./test-helpers.js";

describe("Unit | Core | Usecases | DeleteOutflow", function () {
    it("should return the month after outflow deletion", async function () {
        // given
        const command: DeleteOutflowCommand = {
            monthId: 'uuid',
            outflowId: 'uuid',
        };

        const foundMonth = {
            deleteOutflow: sinon.stub(),
        };
        monthRepositoryStub.getById.withArgs(command.monthId).resolves(foundMonth);

        const usecase = new DeleteOutflow(monthRepositoryStub);

        // when
        const month = await usecase.execute(command);

        // then
        expect(foundMonth.deleteOutflow).to.have.been.calledOnceWith(command.outflowId);
        expect(monthRepositoryStub.deleteOutflow).to.have.been.calledOnceWith(command.outflowId);
        expect(month).to.deep.equal(foundMonth);
    });
    it("should throw an error if month is not found", async function () {
        // given
        const command: DeleteOutflowCommand = {
            monthId: 'uuid',
            outflowId: 'uuid',
        };

        monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

        const usecase = new DeleteOutflow(monthRepositoryStub);

        // when / then
        await expect(usecase.execute(command)).to.be.rejectedWith(MonthNotFoundError);
    });
});
