export default class DeleteOutflowCommandError extends Error {
    constructor(message: string) {
        super('DeleteOutflowCommand: ' + message);
        this.name = 'DeleteOutflowCommandError';
    }
}
