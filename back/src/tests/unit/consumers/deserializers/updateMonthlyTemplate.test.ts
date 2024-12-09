import expect from "../../../test-helpers.js";
import deserializer from "../../../../consumers/api/deserializers/updateMonthlyTemplate.js";

describe("Unit | Consumers | deserializers | updateMonthlyTemplate", function () {
  const body = {
    name: "JOW",
    isDefault: true,
  };
  const params = {
    id: "ebf6aae9-5664-4e40-974f-9b373524d031",
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(params, body);

    // then
    expect(command).to.be.deep.equal({
      id: params.id,
      name: body.name,
      isDefault: body.isDefault,
    });
  });
});
