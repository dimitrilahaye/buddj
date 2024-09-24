class MonthNotFoundError extends Error {
    constructor() {
        super('Month: not found');
        this.name = 'MonthNotFoundError';
    }
}

export { MonthNotFoundError };
