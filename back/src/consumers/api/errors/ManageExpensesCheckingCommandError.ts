export default class ManageExpensesCheckingCommandError extends Error {
    constructor(message: string) {
        super('ManageExpensesCheckingCommand: ' + message);
        this.name = 'ManageExpensesCheckingCommandError';
    }
}
