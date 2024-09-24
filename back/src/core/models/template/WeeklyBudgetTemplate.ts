export default class WeeklyBudgetTemplate {
    name: string;
    initialBalance: number;

    constructor(props: {name: string}) {
        this.name = props.name;
        this.initialBalance = 200;
    }
}
