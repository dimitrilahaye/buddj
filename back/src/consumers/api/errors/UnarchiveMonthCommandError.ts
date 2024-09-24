export default class UnarchiveMonthCommandError extends Error {
    constructor(message: string) {
        super('UnarchiveMonthCommandError: ' + message);
        this.name = 'UnarchiveMonthCommandError';
    }
}
