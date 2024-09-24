class WeeklyExpenseAmountError extends Error {
    constructor() {
        super('WeeklyExpense: amount should be greater than 0');
        this.name = 'WeeklyExpenseAmountError';
    }
}

class WeeklyExpenseNotFoundError extends Error {
    constructor() {
        super('WeeklyExpense: not found');
        this.name = 'WeeklyExpenseNotFoundError';
    }
}

export {WeeklyExpenseAmountError, WeeklyExpenseNotFoundError};
