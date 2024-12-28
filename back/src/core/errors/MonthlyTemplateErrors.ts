class MonthlyTemplateNameCanNotBeEmptyError extends Error {
  constructor() {
    super("Le nom ne peut être vide");
    this.name = "MonthlyTemplateNameCanNotBeEmptyError";
  }
}

class MonthlyTemplateDoesNotExistError extends Error {
  constructor() {
    super("Template inconnu");
    this.name = "MonthlyTemplateDoesNotExistError";
  }
}

class MonthlyOutflowTemplateLabelCanNotBeEmptyError extends Error {
  constructor() {
    super("Le libellé ne peut pas être vide");
    this.name = "MonthlyOutflowTemplateLabelCanNotBeEmptyError";
  }
}

class MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError extends Error {
  constructor() {
    super("Le montant de la sortie doit être positif");
    this.name = "MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError";
  }
}

class MonthlyBudgetTemplateNameCanNotBeEmptyError extends Error {
  constructor() {
    super("Le nom ne peut pas être vide");
    this.name = "MonthlyBudgetTemplateNameCanNotBeEmptyError";
  }
}

class MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError extends Error {
  constructor() {
    super("Le solde initial du budget doit être positif");
    this.name = "MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError";
  }
}

export {
  MonthlyTemplateNameCanNotBeEmptyError,
  MonthlyTemplateDoesNotExistError,
  MonthlyOutflowTemplateLabelCanNotBeEmptyError,
  MonthlyBudgetTemplateNameCanNotBeEmptyError,
  MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError,
  MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError,
};
