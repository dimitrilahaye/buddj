import expect from "../../../../test-helpers.js";
import { resetStubs, yearlyOutflowRepositoryStub } from "../test-helpers.js";
import RemoveYearlyOutflow from "../../../../../core/usecases/yearly-saving/RemoveYearlyOutflow.js";
import YearlyOutflows from "../../../../../core/models/yearly-outflows/YearlyOutflows.js";
import sinon from "sinon";

describe("Unit | Core | Usecases | RemoveYearlyOutflow", function () {
  before(() => {
    resetStubs();
  });

  it("should call the repository and return the outflows", async () => {
    // given
    const idToRemove = "id";
    const foundList = new YearlyOutflows([]);
    foundList.remove = sinon.stub().withArgs(idToRemove);
    yearlyOutflowRepositoryStub.getAll.resolves(foundList);
    yearlyOutflowRepositoryStub.remove.resolves(foundList);
    const usecase = new RemoveYearlyOutflow(yearlyOutflowRepositoryStub);
    const command = {
      id: idToRemove,
    };

    // when
    const list = await usecase.execute(command);

    // then
    expect(yearlyOutflowRepositoryStub.getAll).to.have.been.calledOnce;
    expect(foundList.remove).to.have.been.calledWithExactly(command.id);
    expect(yearlyOutflowRepositoryStub.remove).to.have.been.calledWithExactly(
      command.id
    );
    expect(list).to.deep.equal(foundList);
  });
});
