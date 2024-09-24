import sinon from "sinon";
import expect from "../../../test-helpers.js";
import ArchiveMonthCommand from "../../../../core/commands/ArchiveMonthCommand.js";
import ArchiveMonth from "../../../../core/usecases/ArchiveMonth.js";
import {MonthNotFoundError} from "../../../../core/errors/MonthErrors.js";
import {monthRepositoryStub} from "./test-helpers.js";

describe('Unit | Core | Usecases | ArchiveMonth', function () {
    it('should return an up to date Month', async function () {
        // given
        const command: ArchiveMonthCommand = {
            monthId: 'month-id',
        };

        const month = {
            archive: sinon.stub(),
        };
        monthRepositoryStub.getById.withArgs(command.monthId).resolves(month);

        const usecase = new ArchiveMonth(monthRepositoryStub);

        // when
        const updatedMonth = await usecase.execute(command);

        // then
        expect(month.archive.calledOnce).to.be.true;
        expect(monthRepositoryStub.archive).to.have.been.calledOnceWith(month);
        expect(updatedMonth).to.deep.equal(month);
    });
    it('should throw an error if month is not found', async function () {
        // given
        const command: ArchiveMonthCommand = {
            monthId: 'month-id',
        };

        monthRepositoryStub.getById.withArgs(command.monthId).resolves(null);

        const usecase = new ArchiveMonth(monthRepositoryStub);

        // when / then
        await expect(usecase.execute(command)).to.be.rejectedWith(MonthNotFoundError);
    });
});
