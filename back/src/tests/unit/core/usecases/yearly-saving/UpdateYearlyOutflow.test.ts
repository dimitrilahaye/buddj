import sinon from "sinon";
import expect from "../../../../test-helpers.js";
import { resetStubs, yearlyOutflowRepositoryStub } from "../test-helpers.js";
import UpdateYearlyOutflow from "../../../../../core/usecases/yearly-saving/UpdateYearlyOutflow.js";
import YearlyOutflows from "../../../../../core/models/yearly-outflows/YearlyOutflows.js";

describe("Unit | Core | Usecases | UpdateYearlyOutflow", function () {
  beforeEach(() => {
    resetStubs();
  });

  it("should update the saving through the list and persist it", async () => {
    // given
    const foundList = new YearlyOutflows([]);
    const updated = Symbol("updated");
    foundList.update = sinon.stub().returns(updated);
    const persistedList = new YearlyOutflows([]);
    yearlyOutflowRepositoryStub.getAll.resolves(foundList);
    yearlyOutflowRepositoryStub.update.resolves(persistedList);
    const usecase = new UpdateYearlyOutflow(yearlyOutflowRepositoryStub);

    // when
    const list = await usecase.execute({ id: "id", label: "Assurance", amount: 600 });

    // then
    expect(foundList.update).to.have.been.calledOnceWithExactly(
      "id",
      "Assurance",
      600
    );
    expect(yearlyOutflowRepositoryStub.update).to.have.been.calledOnceWithExactly(
      updated
    );
    expect(list).to.equal(persistedList);
  });
});
