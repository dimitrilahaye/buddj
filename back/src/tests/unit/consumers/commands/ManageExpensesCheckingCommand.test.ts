import expect from "../../../test-helpers.js";
import ManageExpensesCheckingCommand from "../../../../consumers/api/commands/ManageExpensesCheckingCommand.js";

describe("Unit | Consumers | Commands | ManageExpensesCheckingCommand", function () {
    const body = {
        weeklyBudgets: [
            {
                id: '0aca11a5-7870-48e0-a438-78a47e876829',
                expenses: [
                    {
                        id: '0aca11a5-7870-48e0-a438-78a47e876829',
                        isChecked: false,
                    },
                ],
            },
            {
                id: '0aca11a5-7870-48e0-a438-78a47e876829',
                expenses: [
                    {
                        id: '0aca11a5-7870-48e0-a438-78a47e876829',
                        isChecked: true,
                    },
                ],
            },
        ]
    };
    const params = {
        monthId: '0aca11a5-7870-48e0-a438-78a47e876829',
    };

    it("should return a right command", async function () {
        // when
        const command = ManageExpensesCheckingCommand.toCommand(params, body);

        // then
        expect(command).instanceof(ManageExpensesCheckingCommand);
    });
});
