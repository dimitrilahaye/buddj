import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/monthCreation.js";

describe("Unit | Consumers | deserializers | monthCreation", function () {
  const body = {
    month: new Date(),
    startingBalance: 2000,
    outflows: [
      {
        label: "outlfow",
        amount: 10.05,
      },
    ],
    weeklyBudgets: [
      {
        name: "Semaine 1",
        initialBalance: 200,
      },
    ],
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(body);

    // then
    expect(command).to.deep.equal({
      date: body.month,
      initialBalance: body.startingBalance,
      outflows: [
        {
          label: body.outflows[0].label,
          amount: body.outflows[0].amount,
        },
      ],
      weeklyBudgets: [
        {
          name: body.weeklyBudgets[0].name,
          initialBalance: body.weeklyBudgets[0].initialBalance,
        },
      ],
    });
  });
});
