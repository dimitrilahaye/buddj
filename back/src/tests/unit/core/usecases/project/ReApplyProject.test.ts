import expect from "../../../../test-helpers.js";
import { resetStubs, projectRepositoryStub } from "../test-helpers.js";
import ReApplyProject from "../../../../../core/usecases/project/ReApplyProject.js";
import { ProjectNotFoundError } from "../../../../../core/errors/ProjectErrors.js";
import { afterEach } from "mocha";
import sinon from "sinon";

describe("Unit | Core | Usecases | ReApplyProject", () => {
  afterEach(() => {
    resetStubs();
  });

  it("should throw an error if project does not exist", async () => {
    // given
    projectRepositoryStub.getById.resolves(null);
    const usecase = new ReApplyProject(projectRepositoryStub);

    // then
    await expect(usecase.execute({ id: "unknown-id" })).to.be.rejectedWith(
      ProjectNotFoundError
    );
  });

  it("should re-apply and save the project", async () => {
    // given
    const projectFound = {
      reApply: sinon.spy(),
    };
    projectRepositoryStub.getById.resolves(projectFound);
    const usecase = new ReApplyProject(projectRepositoryStub);

    // when
    const project = await usecase.execute({ id: "id" });

    // then
    expect(projectRepositoryStub.getById).to.have.been.calledOnceWithExactly(
      "id"
    );
    expect(projectFound.reApply).to.have.been.calledOnce;
    expect(projectRepositoryStub.save).to.have.been.calledOnceWithExactly(
      projectFound
    );
    expect(project).to.deep.equal(projectFound);
  });
});
