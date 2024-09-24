class MonthCreationTemplateWeeklyBudgetError extends Error {
    constructor() {
        super('MonthCreationTemplate: should have 5 weekly budgets');
        this.name = 'MonthCreationTemplateWeeklyBudgetError';
    }
}

class MonthCreationOutflowsError extends Error {
    constructor() {
        super('MonthCreationTemplate: should have at least 1 outflow');
        this.name = 'MonthCreationOutflowsError';
    }
}

export {MonthCreationOutflowsError, MonthCreationTemplateWeeklyBudgetError};
