import MonthCreationCommandInterface, {
    OutflowCreationCommand,
    WeeklyBudgetCreationCommand
} from '../../../core/commands/MonthCreationCommand.js';
import MonthCreationCommandError from "../errors/MonthCreationCommandError.js";
import Koi from "../validators/Koi.js";

export default class MonthCreationCommand implements MonthCreationCommandInterface {
    date: Date;
    initialBalance: number;
    outflows: OutflowCreationCommand[];
    weeklyBudgets: WeeklyBudgetCreationCommand[];

    constructor(props: {
        date: Date;
        initialBalance: number;
        outflows: OutflowCreationCommand[];
        weeklyBudgets: WeeklyBudgetCreationCommand[];
    }) {
        this.date = props.date;
        this.initialBalance = props.initialBalance;
        this.outflows = props.outflows;
        this.weeklyBudgets = props.weeklyBudgets;
    }

    static toCommand(body: any): MonthCreationCommandInterface {
        try {
            Koi.validate(body.month).date();
            Koi.validate(body.startingBalance).number();
            Koi.validate(body.outflows).array().notEmpty();
            Koi.validate(body.weeklyBudgets).array().notEmpty();
            body.outflows.forEach((outflow: OutflowCreationCommand) => {
                Koi.validate(outflow.amount).number();
                Koi.validate(outflow.label).string().notEmpty();
            });
            body.weeklyBudgets.forEach((weeklyBudget: WeeklyBudgetCreationCommand) => {
                Koi.validate(weeklyBudget.initialBalance).number();
                Koi.validate(weeklyBudget.name).string().notEmpty();
            });
        } catch (e: any) {
            throw new MonthCreationCommandError(e.message);
        }

        return new MonthCreationCommand({
            date: body.month,
            initialBalance: body.startingBalance,
            outflows: body.outflows.map((outflow: OutflowCreationCommand) => ({
                label: outflow.label,
                amount: outflow.amount,
            })),
            weeklyBudgets: body.weeklyBudgets.map((weeklyBudget: WeeklyBudgetCreationCommand) => ({
                name: weeklyBudget.name,
                initialBalance: weeklyBudget.initialBalance,
            })),
        });
    }
}
