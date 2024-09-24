import MonthRepository from "../ports/repositories/MonthRepository.js";
import ManageExpensesCheckingCommand from "../commands/ManageExpensesCheckingCommand.js";
import {MonthNotFoundError} from "../errors/MonthErrors.js";

export default class ManageExpensesChecking {
    constructor(
        public monthRepository: MonthRepository,
    ) {}

    async execute(command: ManageExpensesCheckingCommand) {
        const month = await this.monthRepository.getById(command.monthId);

        if (month === null) {
            throw new MonthNotFoundError();
        }

        for (const weekly of command.weeklyBudgets) {
           for (const expense of weekly.expenses) {
               if (expense.isChecked) {
                   month.checkExpense(weekly.id, expense.id);
               }
               if (!expense.isChecked) {
                   month.uncheckExpense(weekly.id, expense.id);
               }
           }
            await this.monthRepository.updateWeeklyBudgetCurrentBalance(month, weekly.id);
        }

        await this.monthRepository.manageExpensesChecking(month, command.weeklyBudgets);

        return month;
    }
}
