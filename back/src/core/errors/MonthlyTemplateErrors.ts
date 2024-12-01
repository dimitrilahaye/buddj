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

class NoDefaultMonthlyTemplateError extends Error {
  constructor() {
    super(
      "MonthlyTemplate: you need a default template in order to create a month"
    );
    this.name = "NoDefaultMonthlyTemplateError";
  }
}

export {
  MonthlyTemplateOutflowsError,
  MonthlyTemplateBudgetError,
  NoDefaultMonthlyTemplateError,
};
