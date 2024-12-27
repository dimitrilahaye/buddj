import expect from "../../../../test-helpers.js";
import UpdateExpenseCommand from "../../../../../consumers/api/commands/UpdateExpenseCommand.js";

/**
 * @deprecated
 */
describe.skip("Unit | Consumers | Commands | UpdateExpenseCommand", function () {
  const params = {
    monthId: "3464842b-2f11-4a9b-ac9a-8c8ce2c4ac88",
    weeklyId: "3464842b-2f11-4a9b-ac9a-8c8ce2c4ac88",
    expenseId: "3464842b-2f11-4a9b-ac9a-8c8ce2c4ac88",
  };
  const body = {
    newWeeklyId: "3464842b-2f11-4a9b-ac9a-8c8ce2c4ac88",
    label: "JOW",
    amount: 10,
  };

  it("should return a right command", async function () {
    // when
    const command = UpdateExpenseCommand.toCommand(params, body);

    // then
    expect(command).instanceof(UpdateExpenseCommand);
  });
});
