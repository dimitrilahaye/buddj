class WeeklyBudgetInitialBalanceError extends Error {
    constructor() {
        super('WeeklyBudget: initial balance should be greater than 0');
        this.name = 'WeeklyBudgetInitialBalanceError';
    }
}

class WeeklyBudgetNotFoundError extends Error {
    constructor() {
        super('WeeklyBudget: not found');
        this.name = 'WeeklyBudgetNotFoundError';
    }
}

export { WeeklyBudgetInitialBalanceError, WeeklyBudgetNotFoundError };
