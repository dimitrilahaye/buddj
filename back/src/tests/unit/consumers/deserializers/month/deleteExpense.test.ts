import expect from "../../../../test-helpers.js";
import deserializer from "../../../../../consumers/api/deserializers/month/deleteExpense.js";

describe("Unit | Consumers | deserializers | deleteExpense", function () {
  const params = {
    monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
    weeklyId: "ff1fb6fd-68f5-4987-aba8-185ed5119f91",
    expenseId: "ff1fb6fd-68f5-4987-aba8-185ed5119f91",
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(params);

    // then
    expect(command).to.deep.equal({
      monthId: params.monthId,
      weeklyId: params.weeklyId,
      expenseId: params.expenseId,
    });
  });
});
