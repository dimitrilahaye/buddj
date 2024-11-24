import expect from "../../../test-helpers.js";
import { yearlyOutflowRepositoryStub } from "./test-helpers.js";
import GetYearlyOutflows from "../../../../core/usecases/GetYearlyOutflows.js";

describe("Unit | Core | Usecases | GetYearlyOutflows", function () {
  it("should call the repository and return the outflows", async () => {
    // given
    const foundList = Symbol("foundList");
    yearlyOutflowRepositoryStub.getAll.resolves(foundList);
    const usecase = new GetYearlyOutflows(yearlyOutflowRepositoryStub);

    // when
    const list = await usecase.execute();

    // then
    expect(yearlyOutflowRepositoryStub.getAll).to.have.been.calledOnce;
    expect(list).to.deep.equal(foundList);
  });
});
