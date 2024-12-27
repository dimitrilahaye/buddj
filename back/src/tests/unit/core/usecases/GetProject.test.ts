import expect from "../../../test-helpers.js";
import { resetStubs, projectRepositoryStub } from "./test-helpers.js";
import GetProject from "../../../../core/usecases/GetProject.js";
import { ProjectNotFoundError } from "../../../../core/errors/ProjectErrors.js";
import { afterEach } from "mocha";
import sinon from "sinon";

describe("Unit | Core | Usecases | GetProject", () => {
  afterEach(() => {
    resetStubs();
  });

  it("should throw an error if project does not exist", async () => {
    // given
    projectRepositoryStub.getById.resolves(null);
    const usecase = new GetProject(projectRepositoryStub);

    // then
    await expect(usecase.execute({ id: "unknown-id" })).to.be.rejectedWith(
      ProjectNotFoundError
    );
  });

  it("should return the found project", async () => {
    // given
    const projectFound = Symbol("projectFound");
    projectRepositoryStub.getById.resolves(projectFound);
    const usecase = new GetProject(projectRepositoryStub);

    // when
    const project = await usecase.execute({
      id: "id",
    });

    // then
    expect(projectRepositoryStub.getById).to.have.been.calledOnceWithExactly(
      "id"
    );
    expect(project).to.deep.equal(projectFound);
  });
});
