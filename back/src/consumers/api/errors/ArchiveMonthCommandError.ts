export default class ArchiveMonthCommandError extends Error {
    constructor(message: string) {
        super('ArchiveMonthCommandError: ' + message);
        this.name = 'ArchiveMonthCommandError';
    }
}
