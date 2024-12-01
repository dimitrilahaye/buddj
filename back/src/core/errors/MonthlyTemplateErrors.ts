class MonthlyTemplateBudgetError extends Error {
  constructor() {
    super("MonthlyTemplate: should have 5 weekly budgets");
    this.name = "MonthlyTemplateBudgetError";
  }
}

class MonthlyTemplateOutflowsError extends Error {
  constructor() {
    super("MonthlyTemplate: should have at least 1 outflow");
    this.name = "MonthlyTemplateOutflowsError";
  }
}

export { MonthlyTemplateOutflowsError, MonthlyTemplateBudgetError };
