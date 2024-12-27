import expect from "../../../../test-helpers.js";
import deserializer from "../../../../../consumers/api/deserializers/month/monthCreation.js";

describe("Unit | Consumers | deserializers | monthCreation", function () {
  const body = {
    month: new Date().toISOString(),
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
        expenses: [
          {
            label: "outlfow",
            amount: 10.05,
            date: new Date().toISOString(),
          },
        ],
      },
    ],
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(body);

    // then
    expect(command).to.deep.equal({
      date: new Date(body.month),
      initialBalance: body.startingBalance,
      outflows: [
        {
          ...body.outflows[0],
          pendingFrom: null,
        },
      ],
      weeklyBudgets: [
        {
          ...body.weeklyBudgets[0],
          pendingFrom: null,
          expenses: [
            {
              ...body.weeklyBudgets[0].expenses[0],
              date: new Date(body.weeklyBudgets[0].expenses[0].date),
            },
          ],
        },
      ],
    });
  });
});
