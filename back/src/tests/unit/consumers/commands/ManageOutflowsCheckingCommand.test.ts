import expect from "../../../test-helpers.js";
import ManageOutflowsCheckingCommand from "../../../../consumers/api/commands/ManageOutflowsCheckingCommand.js";

describe("Unit | Consumers | Commands | ManageOutflowsCheckingCommand", function () {
    const body = {
        currentBalance: 2000,
        outflows: [
            {
                id: '0aca11a5-7870-48e0-a438-78a47e876829',
                isChecked: false,
            },
            {
                id: '0aca11a5-7870-48e0-a438-78a47e876829',
                isChecked: true,
            },
        ],
    };
    const params = {
        monthId: '0aca11a5-7870-48e0-a438-78a47e876829',
    };

    it("should return a right command", async function () {
        // when
        const command = ManageOutflowsCheckingCommand.toCommand(params, body);

        // then
        expect(command).instanceof(ManageOutflowsCheckingCommand);
    });
});
