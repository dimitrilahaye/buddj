import expect from "../../../test-helpers.js";
import MonthCreationCommand from "../../../../consumers/api/commands/MonthCreationCommand.js";

describe("Unit | Consumers | Commands | MonthCreationCommand", function () {
    const body = {
        month: new Date(),
        startingBalance: 2000,
        outflows: [
            {
                label: 'outlfow',
                amount: 10.05,
            },
        ],
        weeklyBudgets: [
            {
                name: 'Semaine 1',
                initialBalance: 200,
            },
        ],
    };

    it("should return a right command", async function () {
        // when
        const command = MonthCreationCommand.toCommand(body);

        // then
        expect(command).instanceof(MonthCreationCommand);
    });
});
