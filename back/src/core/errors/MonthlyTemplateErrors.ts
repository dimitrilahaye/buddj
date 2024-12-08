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

export {
  NoDefaultMonthlyTemplateError,
  MonthlyTemplateNameCanNotBeEmptyError,
  MonthlyTemplateDoesNotExistError,
};
