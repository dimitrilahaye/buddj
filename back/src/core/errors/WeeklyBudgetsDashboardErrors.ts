class WeeklyBudgetsDashboardWeeklyBudgetsError extends Error {
    constructor() {
        super('WeeklyBudgetsDashboard: should have 5 weekly budgets');
        this.name = 'WeeklyBudgetsDashboardWeeklyBudgetsError';
    }
}

export { WeeklyBudgetsDashboardWeeklyBudgetsError };
