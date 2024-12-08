import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/deleteMonthlyOutflow.js";

describe("Unit | Consumers | deserializers | deleteMonthlyOutflow", function () {
  const params = {
    templateId: "ebf6aae9-5664-4e40-974f-9b373524d031",
    outflowId: "fe2498f8-a136-4524-b233-6da568fd45c8",
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(params);

    // then
    expect(command).to.be.deep.equal({
      templateId: params.templateId,
      outflowId: params.outflowId,
    });
  });
});
