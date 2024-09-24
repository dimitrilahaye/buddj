import expect from "../../../test-helpers.js";
import UnarchiveMonthCommand from "../../../../consumers/api/commands/UnarchiveMonthCommand.js";

describe("Unit | Consumers | Commands | UnarchiveMonthCommand", function () {
    const params = {
        monthId: 'ebf6aae9-5664-4e40-974f-9b373524d031',
    };

    it("should return a right command", async function () {
        // when
        const command = UnarchiveMonthCommand.toCommand(params);

        // then
        expect(command).instanceof(UnarchiveMonthCommand);
    });
});
