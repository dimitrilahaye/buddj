import expect from "../../../../test-helpers.js";
import deserializer from "../../../../../consumers/api/deserializers/month/archiveMonth.js";

describe("Unit | Consumers | deserializers | archiveMonth", function () {
  const params = {
    monthId: "ebf6aae9-5664-4e40-974f-9b373524d031",
  };

  it("should return a right command", async function () {
    // when
    const command = deserializer(params);

    // then
    expect(command).to.deep.equal({
      monthId: params.monthId,
    });
  });
});
