import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/addMonthlyOutflow.js";

describe("Unit | Consumers | deserializers | addMonthlyOutflow", function () {
  const body = {
    label: "JOW",
    amount: 10,
  };
  const params = {
    templateId: "ebf6aae9-5664-4e40-974f-9b373524d031",
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(params, body);

    // then
    expect(command).to.be.deep.equal({
      templateId: params.templateId,
      label: body.label,
      amount: body.amount,
    });
  });
});
