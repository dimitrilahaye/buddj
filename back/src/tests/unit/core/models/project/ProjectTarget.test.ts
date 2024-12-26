import expect from "../../../../test-helpers.js";
import ProjectTarget from "../../../../../core/models/project/ProjectTarget.js";
import { ProjectTargetMustBePositiveError } from "../../../../../core/errors/ProjectErrors.js";

describe("Unit | Core | Models | Project | ProjectTarget", function () {
  describe("#constructor", function () {
    it("should give right project target", function () {
      // when
      const target = new ProjectTarget(20);

      // then
      expect(target.value).to.deep.equal(20);
    });

    it("should throw an error if target is not positive", function () {
      // when / then
      expect(() => new ProjectTarget(0)).to.throw(
        ProjectTargetMustBePositiveError
      );
    });
  });
});
