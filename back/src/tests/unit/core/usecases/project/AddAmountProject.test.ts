import expect from "../../../../test-helpers.js";
import { resetStubs, projectRepositoryStub } from "../test-helpers.js";
import AddAmountProject from "../../../../../core/usecases/project/AddAmountProject.js";
import { ProjectNotFoundError } from "../../../../../core/errors/ProjectErrors.js";
import { afterEach } from "mocha";
import sinon from "sinon";

describe("Unit | Core | Usecases | AddAmountProject", () => {
  afterEach(() => {
    resetStubs();
  });

  it("should throw an error if project does not exist", async () => {
    // given
    projectRepositoryStub.getById.resolves(null);
    const usecase = new AddAmountProject(projectRepositoryStub);

    // then
    await expect(
      usecase.execute({ id: "unknown-id", amount: 10 })
    ).to.be.rejectedWith(ProjectNotFoundError);
  });

  it("should add the amount", async () => {
    // given
    const projectFound = {
      add: sinon.spy(),
    };
    projectRepositoryStub.getById.resolves(projectFound);
    const usecase = new AddAmountProject(projectRepositoryStub);

    // when
    const project = await usecase.execute({
      id: "id",
      amount: 10,
    });

    // then
    expect(projectRepositoryStub.getById).to.have.been.calledOnceWithExactly(
      "id"
    );
    expect(projectFound.add).to.have.been.calledOnce;
    expect(projectFound.add).to.have.been.calledWithMatch(
      sinon.match.has("value", 10)
    );
    expect(projectRepositoryStub.save).to.have.been.calledOnceWithExactly(
      projectFound
    );
    expect(project).to.deep.equal(projectFound);
  });
});
