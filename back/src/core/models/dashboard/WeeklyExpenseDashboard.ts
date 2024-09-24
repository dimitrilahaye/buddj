export default class WeeklyExpenseDashboard {
    amount: number;
    isChecked: boolean;

    constructor(props: {amount: number, isChecked: boolean}) {
        this.amount = props.amount;
        this.isChecked = props.isChecked;
    }
}
