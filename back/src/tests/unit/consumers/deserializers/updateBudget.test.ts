import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/updateBudget.js";

describe("Unit | Consumers | deserializers | updateBudget", function () {
  const body = {
    name: "JOW",
  };
  const params = {
    monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
    budgetId: "2e270898-f374-43be-a29a-479eebe7cb35",
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(params, body);

    // then
    expect(command).to.be.deep.equal({
      monthId: params.monthId,
      budgetId: params.budgetId,
      name: body.name,
    });
  });
});
