import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/addYearlyOutflow.js";

describe("Unit | Consumers | deserializers | addYearlyOutflow", function () {
  it("should return a right command", async function () {
    // given
    const body = {
      label: "JOW",
      amount: 10,
      month: 1,
      type: "outflow",
    };

    // when
    const command = deserializer(body);

    // then
    expect(command).to.be.deep.equal({
      label: body.label,
      amount: body.amount,
      month: body.month,
      type: body.type,
    });
  });
});
