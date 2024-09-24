import expect from "../../../test-helpers.js";
import DeleteOutflowCommand from "../../../../consumers/api/commands/DeleteOutflowCommand.js";

describe("Unit | Consumers | Commands | DeleteOutflowCommand", function () {
    const params = {
        monthId: 'ebf6aae9-5664-4e40-974f-9b373524d031',
        outflowId: 'ff1fb6fd-68f5-4987-aba8-185ed5119f91',
    };

    it("should return a right command", async function () {
        // when
        const command = DeleteOutflowCommand.toCommand(params);

        // then
        expect(command).instanceof(DeleteOutflowCommand);
    });
});
