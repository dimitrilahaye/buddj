import expect from "../../../../test-helpers.js";
import updateMonthlyBudget from "../../../../../consumers/api/deserializers/monthly-template/updateMonthlyBudget.js";
import DeserializationError from "../../../../../consumers/api/errors/DeserializationError.js";

const UUID_1 = "ebf6aae9-5664-4e40-974f-9b373524d031";
const UUID_2 = "2e270898-f374-43be-a29a-479eebe7cb35";

describe("Unit | Consumers | deserializers | updateMonthlyBudget", function () {
  it("updateMonthlyBudget should return a right command", function () {
    expect(
      updateMonthlyBudget(
        { templateId: UUID_1, budgetId: UUID_2 },
        { name: "Courses", initialBalance: 250 }
      )
    ).to.deep.equal({
      templateId: UUID_1,
      budgetId: UUID_2,
      name: "Courses",
      initialBalance: 250,
    });
  });

  it("updateMonthlyBudget should reject a missing name", function () {
    expect(() =>
      updateMonthlyBudget(
        { templateId: UUID_1, budgetId: UUID_2 },
        { initialBalance: 250 }
      )
    ).to.throw(DeserializationError);
  });
});
