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
    case "DeserializationError":
      statusCode = 400;
      break;
    case "MonthNotFoundError":
    case "WeeklyBudgetNotFoundError":
    case "WeeklyExpenseNotFoundError":
    case "AccountOutflowNotFoundError":
    case "TransferableAccountNotFoundError":
    case "TransferableWeeklyBudgetNotFoundError":
    case "YearlyOutflowsIdDoesNotExistError":
    case "NoDefaultMonthlyTemplateError":
    case "MonthlyTemplateDoesNotExistError":
      statusCode = 404;
      break;
    case "AccountInitialBalanceError":
    case "AccountWeeklyBudgetsError":
    case "AccountOutflowsError":
    case "WeeklyBudgetInitialBalanceError":
    case "WeeklyExpenseAmountError":
    case "TransferBalanceIntoMonthError":
    case "YearlyOutflowsAddError":
    case "MonthlyTemplateNameCanNotBeEmptyError":
    case "MonthlyOutflowTemplateLabelCanNotBeEmptyError":
    case "MonthlyBudgetTemplateNameCanNotBeEmptyError":
    case "MonthlyOutflowTemplateAmountCanNotBeLessThanOneError":
    case "MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError":
      statusCode = 422;
      break;
    case "WeeklyBudgetsDashboardWeeklyBudgetsError":
      statusCode = 502;
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
