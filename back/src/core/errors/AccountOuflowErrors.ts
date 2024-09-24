class AccountOutflowNotFoundError extends Error {
    constructor() {
        super('AccountOutflow: not found');
        this.name = 'AccountOutflowNotFoundError';
    }
}

export { AccountOutflowNotFoundError };
