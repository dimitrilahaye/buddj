export default interface AddWeeklyExpenseCommand {
    monthId: string;
    weeklyBudgetId: string;
    label: string;
    amount: number;
}
