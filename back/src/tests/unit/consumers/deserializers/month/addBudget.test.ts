import expect from "../../../../test-helpers.js";
import deserializer from "../../../../../consumers/api/deserializers/month/addBudget.js";

describe("Unit | Consumers | deserializers | addBudget", function () {
  const body = {
    name: "JOW",
    initialBalance: 10,
  };
  const params = {
    monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(params, body);

    // then
    expect(command).to.be.deep.equal({
      monthId: params.monthId,
      name: body.name,
      initialBalance: body.initialBalance,
    });
  });
});
