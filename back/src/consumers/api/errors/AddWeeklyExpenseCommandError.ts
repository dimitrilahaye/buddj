export default class AddWeeklyExpenseCommandError extends Error {
    constructor(message: string) {
        super('AddWeeklyExpenseCommand: ' + message);
        this.name = 'AddWeeklyExpenseCommandError';
    }
}
