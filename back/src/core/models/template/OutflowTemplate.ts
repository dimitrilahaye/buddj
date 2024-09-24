export default class OutflowTemplate {
    amount: number;
    label: string;
    isChecked: boolean;

    constructor(props: {label: string, amount: number}) {
        this.label = props.label;
        this.amount = props.amount;
        this.isChecked = false;
    }
}
