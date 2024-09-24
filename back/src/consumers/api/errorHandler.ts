import {NextFunction, Request, Response} from "express";

const errorHandler = (error: Error, request: Request, response: Response, next: NextFunction) => {
    let statusCode: number;
    switch (error.name) {
        case 'MonthCreationCommandError':
        case 'AddWeeklyExpenseCommandError':
        case 'ManageExpensesCheckingCommandError':
        case 'ManageOutflowsCheckingCommandError':
        case 'ArchiveMonthCommandError':
        case 'DeleteExpenseCommandError':
        case 'DeleteOutflowCommandError':
        case 'UpdateExpenseCommandError':
        case 'AddOutflowCommandError':
        case 'UnarchiveMonthCommandError':
        case 'DeleteMonthCommandError':
            statusCode = 400;
            break;
        case 'MonthNotFoundError':
        case 'WeeklyBudgetNotFoundError':
        case 'WeeklyExpenseNotFoundError':
        case 'AccountOutflowNotFoundError':
            statusCode = 404;
            break;
        case 'AccountInitialBalanceError':
        case 'AccountWeeklyBudgetsError':
        case 'AccountOutflowsError':
        case 'WeeklyBudgetInitialBalanceError':
        case 'WeeklyExpenseAmountError':
            statusCode = 422;
            break;
        case 'MonthCreationTemplateWeeklyBudgetError':
        case 'MonthCreationOutflowsError':
        case 'WeeklyBudgetsDashboardWeeklyBudgetsError':
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
}

export default errorHandler;
