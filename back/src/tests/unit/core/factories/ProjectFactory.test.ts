import expect from "../../../test-helpers.js";
import { idProviderStub } from "../usecases/test-helpers.js";
import ProjectFactory from "../../../../core/factories/ProjectFactory.js";
import { CreateProjectCommand } from "../../../../core/usecases/project/CreateProject.js";
import Refund from "../../../../core/models/project/Refund.js";
import Saving from "../../../../core/models/project/Saving.js";

describe("Unit | Core | Factories | ProjectFactory", function () {
  describe("for 'refund' category", () => {
    it("should return an instance of Refund", () => {
      // given
      idProviderStub.get.returns("id");
      const factory = new ProjectFactory(idProviderStub);
      const command: CreateProjectCommand = {
        target: 10,
        name: "label",
        category: "refund",
      };

      // when
      const refund = factory.create(command);

      // then
      expect(refund).to.be.instanceOf(Refund);
      expect(idProviderStub.get).to.have.been.called;
    });
  });

  describe("for 'saving' category", () => {
    it("should return an instance of Saving", () => {
      // given
      idProviderStub.get.returns("id");
      const factory = new ProjectFactory(idProviderStub);
      const command: CreateProjectCommand = {
        target: 10,
        name: "label",
        category: "saving",
      };

      // when
      const saving = factory.create(command);

      // then
      expect(saving).to.be.instanceOf(Saving);
      expect(idProviderStub.get).to.have.been.called;
    });
  });
});
