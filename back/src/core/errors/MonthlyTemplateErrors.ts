class NoDefaultMonthlyTemplateError extends Error {
  constructor() {
    super(
      "MonthlyTemplate: you need a default template in order to create a month"
    );
    this.name = "NoDefaultMonthlyTemplateError";
  }
}

class MonthlyTemplateNameCanNotBeEmptyError extends Error {
  constructor() {
    super("MonthlyTemplate: template name can not be empty");
    this.name = "MonthlyTemplateNameCanNotBeEmptyError";
  }
}

class MonthlyTemplateDoesNotExistError extends Error {
  constructor() {
    super("MonthlyTemplate: template with given id does not exist");
    this.name = "MonthlyTemplateDoesNotExistError";
  }
}

class MonthlyOutflowTemplateLabelCanNotBeEmptyError extends Error {
  constructor() {
    super("MonthlyOutflowTemplate: outflow label can not be empty");
    this.name = "MonthlyOutflowTemplateLabelCanNotBeEmptyError";
  }
}

class MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError extends Error {
  constructor() {
    super("MonthlyOutflowTemplate: outflow amount must be greater than 0");
    this.name = "MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError";
  }
}

class MonthlyBudgetTemplateNameCanNotBeEmptyError extends Error {
  constructor() {
    super("MonthlyBudgetTemplate: budget name can not be empty");
    this.name = "MonthlyBudgetTemplateNameCanNotBeEmptyError";
  }
}

class MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError extends Error {
  constructor() {
    super(
      "MonthlyBudgetTemplate: outflow initial balance must be greater than 0"
    );
    this.name = "MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError";
  }
}

export {
  NoDefaultMonthlyTemplateError,
  MonthlyTemplateNameCanNotBeEmptyError,
  MonthlyTemplateDoesNotExistError,
  MonthlyOutflowTemplateLabelCanNotBeEmptyError,
  MonthlyBudgetTemplateNameCanNotBeEmptyError,
  MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError,
  MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError,
};
