import expect from "../../../test-helpers.js";
import { yearlyOutflowRepositoryStub } from "./test-helpers.js";
import AddYearlyOutflow from "../../../../core/usecases/AddYearlyOutflow.js";
import YearlyOutflows from "../../../../core/models/yearly-outflows/YearlyOutflows.js";
import sinon from "sinon";

describe("Unit | Core | Usecases | AddYearlyOutflow", function () {
  it("should call the repository and return the outflows", async () => {
    // given
    const foundList = new YearlyOutflows([]);
    const listAddSpy = sinon.spy(foundList, "add");
    yearlyOutflowRepositoryStub.getAll.resolves(foundList);
    yearlyOutflowRepositoryStub.add.resolves(foundList);
    const usecase = new AddYearlyOutflow(yearlyOutflowRepositoryStub);
    const command = {
      id: "id",
      label: "label",
      amount: 10,
      month: 1,
    };

    // when
    const list = await usecase.execute(command);

    // then
    expect(yearlyOutflowRepositoryStub.getAll).to.have.been.calledOnce;
    expect(listAddSpy).to.have.been.calledWithExactly(command);
    expect(yearlyOutflowRepositoryStub.add).to.have.been.calledWithExactly(
      command
    );
    expect(list).to.deep.equal(foundList);
  });
});
