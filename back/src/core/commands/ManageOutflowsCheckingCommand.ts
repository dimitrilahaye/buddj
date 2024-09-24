export default interface ManageOutflowsCheckingCommand {
    monthId: string;
    currentBalance: number;
    outflows: {
        id: string;
        isChecked: boolean;
    }[];
}
