import expect from "../../../../test-helpers.js";
import ProjectName from "../../../../../core/models/project/ProjectName.js";
import { ProjectNameCanNotBeEmptyError } from "../../../../../core/errors/ProjectErrors.js";

describe("Unit | Core | Models | Project | ProjectName", function () {
  describe("#constructor", function () {
    it("should give right project name", function () {
      // when
      const name = new ProjectName("iPhone");

      // then
      expect(name.value).to.deep.equal("iPhone");
    });

    it("should throw an error if name is empty", function () {
      // when / then
      expect(() => new ProjectName("")).to.throw(ProjectNameCanNotBeEmptyError);
    });
  });
});
