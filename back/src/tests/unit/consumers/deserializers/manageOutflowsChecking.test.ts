import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/manageOutflowChecking.js";

describe("Unit | Consumers | deserializers | manageOutflowsChecking", function () {
  const body = {
    currentBalance: 2000,
    outflows: [
      {
        id: "0aca11a5-7870-48e0-a438-78a47e876829",
        isChecked: false,
      },
      {
        id: "0aca11a5-7870-48e0-a438-78a47e876829",
        isChecked: true,
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
      currentBalance: body.currentBalance,
      outflows: body.outflows,
    });
  });
});
