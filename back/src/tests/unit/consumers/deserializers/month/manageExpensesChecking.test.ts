import expect from "../../../../test-helpers.js";
import deserializer from "../../../../../consumers/api/deserializers/month/manageExpenseChecking.js";

describe("Unit | Consumers | deserializers | manageExpensesChecking", function () {
  const body = {
    weeklyBudgets: [
      {
        id: "0aca11a5-7870-48e0-a438-78a47e876829",
        expenses: [
          {
            id: "0aca11a5-7870-48e0-a438-78a47e876829",
            isChecked: false,
          },
        ],
      },
      {
        id: "0aca11a5-7870-48e0-a438-78a47e876829",
        expenses: [
          {
            id: "0aca11a5-7870-48e0-a438-78a47e876829",
            isChecked: true,
          },
        ],
      },
    ],
  };
  const params = {
    monthId: "0aca11a5-7870-48e0-a438-78a47e876829",
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(params, body);

    // then
    expect(command).to.deep.equal({
      monthId: params.monthId,
      weeklyBudgets: body.weeklyBudgets,
    });
  });
});
