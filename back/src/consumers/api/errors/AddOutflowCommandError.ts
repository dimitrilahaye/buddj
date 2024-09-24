export default class AddOutflowCommandError extends Error {
    constructor(message: string) {
        super('AddOutflowCommand: ' + message);
        this.name = 'AddOutflowCommandError';
    }
}
