import expect from "../../../../test-helpers.js";
import updateYearlyOutflow from "../../../../../consumers/api/deserializers/yearly-saving/updateYearlyOutflow.js";
import DeserializationError from "../../../../../consumers/api/errors/DeserializationError.js";

const UUID_1 = "ebf6aae9-5664-4e40-974f-9b373524d031";
const UUID_2 = "2e270898-f374-43be-a29a-479eebe7cb35";

describe("Unit | Consumers | deserializers | updateYearlyOutflow", function () {
  it("updateYearlyOutflow should return a right command", function () {
    expect(
      updateYearlyOutflow({ id: UUID_1 }, { label: "Assurance", amount: 600 })
    ).to.deep.equal({ id: UUID_1, label: "Assurance", amount: 600 });
  });

  it("updateYearlyOutflow should reject a malformed id", function () {
    expect(() =>
      updateYearlyOutflow({ id: "nope" }, { label: "Assurance", amount: 600 })
    ).to.throw(DeserializationError);
  });
});
