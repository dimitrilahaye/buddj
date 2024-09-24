export default interface ManageExpensesCheckingCommand {
    monthId: string;
    weeklyBudgets: {
        id: string,
        expenses: { id: string, isChecked: boolean }[],
    }[];
}
