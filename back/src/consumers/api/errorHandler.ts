import { NextFunction, Request, Response } from "express";

const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  let statusCode: number;
  switch (error.name) {
    /** @deprecated */
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
    case "ProjectNotFoundError":
      statusCode = 404;
      break;
    case "AccountInitialBalanceError":
    case "WeeklyExpenseAmountError":
    case "TransferBalanceIntoMonthError":
    case "YearlySavingsAddError":
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
      statusCode = 422;
      break;
    default:
      statusCode = 500;
      break;
  }
  console.log(statusCode, error.message);
  response.status(statusCode).json({
    success: false,
    message: error.message,
  });
};

export default errorHandler;
