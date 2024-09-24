import expect from "../../../test-helpers.js";
import AddOutflowCommand from "../../../../consumers/api/commands/AddOutflowCommand.js";

describe("Unit | Consumers | Commands | AddOutflowCommand", function () {
    const body = {
        label: 'JOW',
        amount: 10,
    };
    const params = {
        monthId: 'ebf6aae9-5664-4e40-974f-9b373524d031',
    };

    it("should return a right command", async function () {
        // when
        const command = AddOutflowCommand.toCommand(params, body);

        // then
        expect(command).instanceof(AddOutflowCommand);
    });
});
