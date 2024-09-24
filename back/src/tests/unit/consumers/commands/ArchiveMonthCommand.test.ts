import expect from "../../../test-helpers.js";
import ArchiveMonthCommand from "../../../../consumers/api/commands/ArchiveMonthCommand.js";

describe("Unit | Consumers | Commands | ArchiveMonthCommand", function () {
    const params = {
        monthId: 'ebf6aae9-5664-4e40-974f-9b373524d031',
    };

    it("should return a right command", async function () {
        // when
        const command = ArchiveMonthCommand.toCommand(params);

        // then
        expect(command).instanceof(ArchiveMonthCommand);
    });
});
