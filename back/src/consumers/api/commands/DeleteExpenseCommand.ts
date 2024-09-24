import DeleteExpenseCommandInterface from '../../../core/commands/DeleteExpenseCommand.js';
import Koi from "../validators/Koi.js";
import DeleteExpenseCommandError from "../errors/DeleteExpenseCommandError.js";

export default class DeleteExpenseCommand implements DeleteExpenseCommandInterface {
    monthId: string;
    weeklyId: string;
    expenseId: string;

    constructor(props: {
        monthId: string;
        weeklyId: string;
        expenseId: string;
    }) {
        this.monthId = props.monthId;
        this.weeklyId = props.weeklyId;
        this.expenseId = props.expenseId;
    }

    static toCommand(params: any): DeleteExpenseCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
            Koi.validate(params.weeklyId).uuid();
            Koi.validate(params.expenseId).uuid();
        } catch (e: any) {
            throw new DeleteExpenseCommandError(e.message);
        }

        return new DeleteExpenseCommand({
            monthId: params.monthId,
            weeklyId: params.weeklyId,
            expenseId: params.expenseId,
        });
    }
}
