import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/addMonthlyBudget.js";

describe("Unit | Consumers | deserializers | addMonthlyBudget", function () {
  const body = {
    name: "JOW",
    initialBalance: 10,
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
      name: body.name,
      initialBalance: body.initialBalance,
    });
  });
});
