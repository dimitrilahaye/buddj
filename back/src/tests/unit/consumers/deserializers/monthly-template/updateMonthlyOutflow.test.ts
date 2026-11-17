import expect from "../../../../test-helpers.js";
import updateMonthlyOutflow from "../../../../../consumers/api/deserializers/monthly-template/updateMonthlyOutflow.js";
import DeserializationError from "../../../../../consumers/api/errors/DeserializationError.js";

const UUID_1 = "ebf6aae9-5664-4e40-974f-9b373524d031";
const UUID_2 = "2e270898-f374-43be-a29a-479eebe7cb35";

describe("Unit | Consumers | deserializers | updateMonthlyOutflow", function () {
  it("updateMonthlyOutflow should return a right command", function () {
    expect(
      updateMonthlyOutflow(
        { templateId: UUID_1, outflowId: UUID_2 },
        { label: "Engie", amount: 90 }
      )
    ).to.deep.equal({
      templateId: UUID_1,
      outflowId: UUID_2,
      label: "Engie",
      amount: 90,
    });
  });

  it("updateMonthlyOutflow should reject a malformed id", function () {
    expect(() =>
      updateMonthlyOutflow(
        { templateId: "nope", outflowId: UUID_2 },
        { label: "Engie", amount: 90 }
      )
    ).to.throw(DeserializationError);
  });
});
