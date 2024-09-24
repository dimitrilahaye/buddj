import {WeeklyExpenseAmountError} from "../../../errors/WeeklyExpenseErrors.js";

export default class WeeklyExpense {
    id: string;
    amount: number;
    label: string;
    isChecked: boolean;
    date: Date;

    constructor(props: {id: string, label: string, amount: number, date: Date, isChecked?: boolean}) {
        if (props.amount <= 0) {
            throw new WeeklyExpenseAmountError();
        }
        this.id = props.id;
        this.label = props.label;
        this.amount = props.amount;
        this.isChecked = props.isChecked ?? false;
        this.date = props.date;
    }

    check() {
        this.isChecked = true;
    }

    uncheck() {
        this.isChecked = false;
    }

    updateAmount(amount: number) {
        if (amount <= 0) {
            throw new WeeklyExpenseAmountError();
        }
        this.amount = amount;
    }

    updateLabel(label: string) {
        this.label = label;
    }
}
