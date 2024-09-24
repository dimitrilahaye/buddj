export type OutflowCreationCommand = {
    label: string,
    amount: number,
}
export type WeeklyBudgetCreationCommand = {
    name: string,
    initialBalance: number,
}
interface MonthCreationCommand {
    date: Date,
    initialBalance: number,
    outflows: OutflowCreationCommand[],
    weeklyBudgets: WeeklyBudgetCreationCommand[],
}

export default MonthCreationCommand;
