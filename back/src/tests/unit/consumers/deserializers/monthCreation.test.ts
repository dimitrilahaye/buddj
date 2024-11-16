import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/monthCreation.js";

describe("Unit | Consumers | deserializers | monthCreation", function () {
  const body = {
    month: new Date(),
    startingBalance: 2000,
    pendingDebits: [
      {
        id: "8d2eead7-f41d-4e6c-9c52-d0f81c22a21b",
        monthId: "a8ac22b1-0090-494a-a3fe-9ec2526cf8d1",
        monthDate: new Date(),
        label: "label",
        amount: 10,
        type: "outflow",
      },
    ],
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
      pendingDebits: [
        {
          id: body.pendingDebits[0].id,
          monthId: body.pendingDebits[0].monthId,
          monthDate: body.pendingDebits[0].monthDate,
          label: body.pendingDebits[0].label,
          amount: body.pendingDebits[0].amount,
          type: body.pendingDebits[0].type,
        },
      ],
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
