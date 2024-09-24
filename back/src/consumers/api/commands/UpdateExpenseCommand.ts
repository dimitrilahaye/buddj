import UpdateExpenseCommandInterface from '../../../core/commands/UpdateExpenseCommand.js';
import Koi from "../validators/Koi.js";
import UpdateExpenseCommandError from "../errors/UpdateExpenseCommandError.js";

export default class UpdateExpenseCommand implements UpdateExpenseCommandInterface {
    monthId: string;
    originalWeeklyId: string;
    newWeeklyId: string;
    expenseId: string;
    label: string;
    amount: number;

    constructor(props: {
        monthId: string;
        originalWeeklyId: string;
        newWeeklyId: string;
        expenseId: string;
        label: string;
        amount: number;
    }) {
        this.monthId = props.monthId;
        this.originalWeeklyId = props.originalWeeklyId;
        this.newWeeklyId = props.newWeeklyId;
        this.expenseId = props.expenseId;
        this.label = props.label;
        this.amount = props.amount;
    }

    static toCommand(params: any, body: any): UpdateExpenseCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
            Koi.validate(params.weeklyId).uuid();
            Koi.validate(params.expenseId).uuid();

            Koi.validate(body.newWeeklyId).uuid();
            Koi.validate(body.label).string();
            Koi.validate(body.amount).number();
        } catch (e: any) {
            throw new UpdateExpenseCommandError(e.message);
        }

        return new UpdateExpenseCommand({
            monthId: params.monthId,
            originalWeeklyId: params.weeklyId,
            expenseId: params.expenseId,
            newWeeklyId: body.newWeeklyId,
            label: body.label,
            amount: body.amount,
        });
    }
}
