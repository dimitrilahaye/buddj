import { NextFunction, Request, Response } from "express";

const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  let statusCode: number;
  switch (error.name) {
    case "UpdateExpenseCommandError":
    case "RequestValidationError":
      statusCode = 400;
      break;
    case "MonthNotFoundError":
    case "WeeklyBudgetNotFoundError":
    case "WeeklyExpenseNotFoundError":
    case "AccountOutflowNotFoundError":
    case "TransferableAccountNotFoundError":
    case "TransferableWeeklyBudgetNotFoundError":
    case "YearlySavingsIdDoesNotExistError":
    case "MonthlyTemplateDoesNotExistError":
    case "MonthlyOutflowTemplateNotFoundError":
    case "MonthlyBudgetTemplateNotFoundError":
    case "ProjectNotFoundError":
      statusCode = 404;
      break;
    case "AccountInitialBalanceError":
    case "WeeklyExpenseAmountError":
    case "AccountOutflowLabelCanNotBeEmptyError":
    case "AccountOutflowAmountMustBePositiveError":
    case "TransferBalanceIntoMonthError":
    case "YearlySavingsAddError":
    case "YearlySavingLabelCanNotBeEmptyError":
    case "YearlySavingAmountMustBePositiveError":
    case "MonthlyTemplateNameCanNotBeEmptyError":
    case "MonthlyOutflowTemplateLabelCanNotBeEmptyError":
    case "MonthlyBudgetTemplateNameCanNotBeEmptyError":
    case "MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError":
    case "MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError":
    case "AccountBudgetNameCantBeEmptyError":
    case "YearlySavingTypeDoesNotExistError":
    case "AccountBudgetCanNotBeRemovedError":
    case "AddedInactiveLogError":
    case "AddedOlderLogError":
    case "ProjectNameCanNotBeEmptyError":
    case "ProjectTargetMustBePositiveError":
    case "ProjectAmountMustBePositiveError":
    case "UnknownCategoryError":
    case "SpendingTrackerRangeError":
      statusCode = 422;
      break;
    default:
      statusCode = 500;
      break;
  }
  console.error(statusCode, error.message);
  response.status(statusCode).json({
    success: false,
    message: error.message,
  });
};

export default errorHandler;
