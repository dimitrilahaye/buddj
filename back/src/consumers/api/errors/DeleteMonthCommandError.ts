export default class DeleteMonthCommandError extends Error {
    constructor(message: string) {
        super('DeleteMonthCommandError: ' + message);
        this.name = 'DeleteMonthCommandError';
    }
}
