import AddWeeklyExpenseCommandInterface from '../../../core/commands/AddWeeklyExpenseCommand.js';
import Koi from "../validators/Koi.js";
import AddWeeklyExpenseCommandError from "../errors/AddWeeklyExpenseCommandError.js";

export default class AddWeeklyExpenseCommand implements AddWeeklyExpenseCommandInterface {
    monthId: string;
    weeklyBudgetId: string;
    label: string;
    amount: number;

    constructor(props: {
        monthId: string;
        weeklyBudgetId: string;
        label: string;
        amount: number;
    }) {
        this.monthId = props.monthId;
        this.weeklyBudgetId = props.weeklyBudgetId;
        this.label = props.label;
        this.amount = props.amount;
    }

    static toCommand(params: any, body: any): AddWeeklyExpenseCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
            Koi.validate(params.weekId).uuid();
            Koi.validate(body.label).string();
            Koi.validate(body.amount).number();
        } catch (e: any) {
            throw new AddWeeklyExpenseCommandError(e.message);
        }

        return new AddWeeklyExpenseCommand({
            monthId: params.monthId,
            weeklyBudgetId: params.weekId,
            label: body.label,
            amount: body.amount,
        });
    }
}
