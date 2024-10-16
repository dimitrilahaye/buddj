import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/addWeeklyExpense.js";

describe("Unit | Consumers | deserializers | addWeeklyExpense", function () {
  const body = {
    label: "JOW",
    amount: 10,
  };
  const params = {
    monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
    weekId: "ff1fb6fd-68f5-4987-aba8-185ed5119f91",
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(params, body);

    // then
    expect(command).to.deep.equal({
      monthId: params.monthId,
      weeklyBudgetId: params.weekId,
      label: body.label,
      amount: body.amount,
    });
  });
});
