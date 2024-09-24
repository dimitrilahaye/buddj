import expect from "../../../test-helpers.js";
import DeleteExpenseCommand from "../../../../consumers/api/commands/DeleteExpenseCommand.js";

describe("Unit | Consumers | Commands | DeleteExpenseCommand", function () {
    const params = {
        monthId: 'ebf6aae9-5664-4e40-974f-9b373524d031',
        weeklyId: 'ff1fb6fd-68f5-4987-aba8-185ed5119f91',
        expenseId: 'ff1fb6fd-68f5-4987-aba8-185ed5119f91',
    };

    it("should return a right command", async function () {
        // when
        const command = DeleteExpenseCommand.toCommand(params);

        // then
        expect(command).instanceof(DeleteExpenseCommand);
    });
});
