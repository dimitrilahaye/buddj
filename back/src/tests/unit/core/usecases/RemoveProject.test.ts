import expect from "../../../test-helpers.js";
import { resetStubs, projectRepositoryStub } from "./test-helpers.js";
import RemoveProject from "../../../../core/usecases/RemoveProject.js";
import { ProjectNotFoundError } from "../../../../core/errors/ProjectErrors.js";
import { afterEach } from "mocha";

describe("Unit | Core | Usecases | RemoveProject", () => {
  afterEach(() => {
    resetStubs();
  });

  it("should throw an error if project does not exist", async () => {
    // given
    projectRepositoryStub.getById.resolves(null);
    const usecase = new RemoveProject(projectRepositoryStub);

    // then
    await expect(usecase.execute({ id: "unknown-id" })).to.be.rejectedWith(
      ProjectNotFoundError
    );
  });

  it("should remove the project", async () => {
    // given
    const projectFound = {
      id: "id",
    };
    projectRepositoryStub.getById.resolves(projectFound);
    const usecase = new RemoveProject(projectRepositoryStub);

    // when
    await usecase.execute({
      id: "id",
    });

    // then
    expect(projectRepositoryStub.remove).to.have.been.calledOnceWithExactly(
      "id"
    );
  });
});
