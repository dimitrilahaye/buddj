import expect from "../../../../test-helpers.js";
import updateOutflow from "../../../../../consumers/api/deserializers/month/updateOutflow.js";
import DeserializationError from "../../../../../consumers/api/errors/DeserializationError.js";

const UUID_1 = "ebf6aae9-5664-4e40-974f-9b373524d031";
const UUID_2 = "2e270898-f374-43be-a29a-479eebe7cb35";

describe("Unit | Consumers | deserializers | updateOutflow", function () {
  it("updateOutflow should return a right command", function () {
    expect(
      updateOutflow(
        { monthId: UUID_1, outflowId: UUID_2 },
        { label: "Engie", amount: 90 }
      )
    ).to.deep.equal({
      monthId: UUID_1,
      outflowId: UUID_2,
      label: "Engie",
      amount: 90,
    });
  });

  it("updateOutflow should reject a non numeric amount", function () {
    expect(() =>
      updateOutflow(
        { monthId: UUID_1, outflowId: UUID_2 },
        { label: "Engie", amount: "90" }
      )
    ).to.throw(DeserializationError);
  });
});
