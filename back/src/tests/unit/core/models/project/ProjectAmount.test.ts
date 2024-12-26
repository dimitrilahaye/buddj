import expect from "../../../../test-helpers.js";
import ProjectAmount from "../../../../../core/models/project/ProjectAmount.js";
import { ProjectAmountMustBePositiveError } from "../../../../../core/errors/ProjectErrors.js";

describe("Unit | Core | Models | Project | ProjectAmount", function () {
  describe("#constructor", function () {
    it("should give right project amount", function () {
      // when
      const amount = new ProjectAmount(20);

      // then
      expect(amount.value).to.deep.equal(20);
    });

    it("should throw an error if amount is not positive", function () {
      // when / then
      expect(() => new ProjectAmount(0)).to.throw(
        ProjectAmountMustBePositiveError
      );
    });
  });
});
