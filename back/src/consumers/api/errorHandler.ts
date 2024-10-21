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
      statusCode = 404;
      break;
    case "AccountInitialBalanceError":
    case "AccountWeeklyBudgetsError":
    case "AccountOutflowsError":
    case "WeeklyBudgetInitialBalanceError":
    case "WeeklyExpenseAmountError":
    case "TransferRemainingBalanceIntoMonthError":
      statusCode = 422;
      break;
    case "MonthCreationTemplateWeeklyBudgetError":
    case "MonthCreationOutflowsError":
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
