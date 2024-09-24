import ManageExpensesCheckingCommandInterface from '../../../core/commands/ManageExpensesCheckingCommand.js';
import Koi from "../validators/Koi.js";
import ManageExpensesCheckingCommandError from "../errors/ManageExpensesCheckingCommandError.js";

export default class ManageExpensesCheckingCommand implements ManageExpensesCheckingCommandInterface {
    monthId: string;
    weeklyBudgets: { id: string; expenses: { id: string; isChecked: boolean; }[]; }[];

    constructor(props: {
        monthId: string;
        weeklyBudgets: { id: string; expenses: { id: string; isChecked: boolean; }[]; }[];
    }) {
        this.monthId = props.monthId;
        this.weeklyBudgets = props.weeklyBudgets;
    }

    static toCommand(params: any, body: any): ManageExpensesCheckingCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
            Koi.validate(body.weeklyBudgets).array().notEmpty();
            body.weeklyBudgets.forEach((weekly: { id: string; expenses: { id: string; isChecked: boolean; }[] }) => {
                Koi.validate(weekly.id).uuid();
                Koi.validate(weekly.expenses).array();
                weekly.expenses.forEach((expense) => {
                    Koi.validate(expense.id).uuid();
                    Koi.validate(expense.isChecked).boolean();
                });
            });
        } catch (e: any) {
            throw new ManageExpensesCheckingCommandError(e.message);
        }

        return new ManageExpensesCheckingCommand({
            monthId: params.monthId,
            weeklyBudgets: body.weeklyBudgets,
        });
    }
}
