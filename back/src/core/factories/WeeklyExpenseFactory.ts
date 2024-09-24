import WeeklyExpense from "../models/month/account/WeeklyExpense.js";
import IdProvider from "../ports/providers/IdProvider.js";

export default class WeeklyExpenseFactory {
    constructor(public readonly idProvider: IdProvider) {
    }

    create(command: any): WeeklyExpense {
        return new WeeklyExpense({
            id: this.idProvider.get(),
            amount: command.amount,
            label: command.label,
            date: new Date(),
            isChecked: false,
        });
    }
}
