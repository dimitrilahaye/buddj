import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/removeYearlyOutflow.js";

describe("Unit | Consumers | deserializers | removeYearlyOutflow", function () {
  it("should return a right command", async function () {
    // given
    const params = {
      id: "ebf6aae9-5664-4e40-974f-9b373524d031",
    };

    // when
    const command = deserializer(params);

    // then
    expect(command).to.be.deep.equal({
      id: params.id,
    });
  });
});
