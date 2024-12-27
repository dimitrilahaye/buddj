import expect from "../../../../test-helpers.js";
import { resetStubs, projectRepositoryStub } from "../test-helpers.js";
import UpdateProject from "../../../../../core/usecases/project/UpdateProject.js";
import { ProjectNotFoundError } from "../../../../../core/errors/ProjectErrors.js";
import { afterEach } from "mocha";
import sinon from "sinon";

describe("Unit | Core | Usecases | UpdateProject", () => {
  afterEach(() => {
    resetStubs();
  });

  it("should throw an error if project does not exist", async () => {
    // given
    projectRepositoryStub.getById.resolves(null);
    const usecase = new UpdateProject(projectRepositoryStub);

    // then
    await expect(usecase.execute({ id: "unknown-id" })).to.be.rejectedWith(
      ProjectNotFoundError
    );
  });

  it("should update name and target", async () => {
    // given
    const projectFound = {
      updateName: sinon.spy(),
      updateTarget: sinon.spy(),
    };
    projectRepositoryStub.getById.resolves(projectFound);
    const usecase = new UpdateProject(projectRepositoryStub);

    // when
    const project = await usecase.execute({
      id: "id",
      name: "name",
      target: 10,
    });

    // then
    expect(projectRepositoryStub.getById).to.have.been.calledOnceWithExactly(
      "id"
    );
    expect(projectFound.updateName).to.have.been.calledWithMatch(
      sinon.match.has("value", "name")
    );
    expect(projectFound.updateTarget).to.have.been.calledWithMatch(
      sinon.match.has("value", 10)
    );
    expect(projectRepositoryStub.update).to.have.been.calledOnceWithExactly(
      projectFound
    );
    expect(project).to.deep.equal(projectFound);
  });
});
