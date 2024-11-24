import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/addYearlyOutflow.js";

describe("Unit | Consumers | deserializers | addYearlyOutflow", function () {
  it("should return a right command", async function () {
    // given
    const body = {
      id: "ebf6aae9-5664-4e40-974f-9b373524d031",
      label: "JOW",
      amount: 10,
      month: 1,
    };

    // when
    const command = deserializer(body);

    // then
    expect(command).to.be.deep.equal({
      id: body.id,
      label: body.label,
      amount: body.amount,
      month: body.month,
    });
  });
});
