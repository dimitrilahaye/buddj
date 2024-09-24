export default class ManageOutflowsCheckingCommandError extends Error {
    constructor(message: string) {
        super('ManageOutflowsCheckingCommand: ' + message);
        this.name = 'ManageOutflowsCheckingCommandError';
    }
}
