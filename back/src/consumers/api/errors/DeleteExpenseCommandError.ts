export default class DeleteExpenseCommandError extends Error {
    constructor(message: string) {
        super('DeleteExpenseCommand: ' + message);
        this.name = 'DeleteExpenseCommandError';
    }
}
