import expect from "../../../test-helpers.js";
import { resetStubs, projectRepositoryStub } from "./test-helpers.js";
import CreateProject from "../../../../core/usecases/CreateProject.js";
import { UnknownCategoryError } from "../../../../core/errors/ProjectErrors.js";
import { afterEach } from "mocha";
import sinon from "sinon";

describe("Unit | Core | Usecases | CreateProject", () => {
  afterEach(() => {
    resetStubs();
  });

  const projectFactoryStub = {
    idProvider: { get: sinon.stub() },
    create: sinon.stub(),
  };

  it("should throw an error if category does not exist", async () => {
    // given
    projectRepositoryStub.getById.resolves(null);
    const command = {
      name: "name",
      target: 10,
      category: "unknown-category" as "refund" | "saving",
    };
    projectFactoryStub.create
      .withArgs(command)
      .throwsException(new UnknownCategoryError("unknown-category"));
    const usecase = new CreateProject(
      projectRepositoryStub,
      projectFactoryStub
    );

    // then
    await expect(usecase.execute(command)).to.be.rejectedWith(
      UnknownCategoryError
    );
  });

  it("should create the project", async () => {
    // given
    projectRepositoryStub.getById.resolves(null);
    const command = {
      name: "name",
      target: 10,
      category: "refund" as "refund" | "saving",
    };
    const createdProject = Symbol("createdProject");
    projectFactoryStub.create.withArgs(command).returns(createdProject);
    const usecase = new CreateProject(
      projectRepositoryStub,
      projectFactoryStub
    );

    // when
    await usecase.execute(command);

    // then
    await expect(projectRepositoryStub.save).to.have.been.calledOnceWithExactly(
      createdProject
    );
  });
});
