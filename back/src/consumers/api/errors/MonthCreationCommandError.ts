export default class MonthCreationCommandError extends Error {
    constructor(message: string) {
        super('MonthCreationCommand: ' + message);
        this.name = 'MonthCreationCommandError';
    }
}
