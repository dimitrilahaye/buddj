import {WeeklyBudgetInitialBalanceError} from "../../../errors/WeeklyBudgetErrors.js";
import WeeklyExpense from "./WeeklyExpense.js";
import {WeeklyExpenseNotFoundError} from "../../../errors/WeeklyExpenseErrors.js";

export default class WeeklyBudget {
    id: string;
    name: string;
    initialBalance: number;
    currentBalance: number;
    startAt: Date | null;
    endAt: Date | null;
    expenses: WeeklyExpense[];

    constructor(props: { id: string, name: string, initialBalance: number, expenses?: WeeklyExpense[] }) {
        if (props.initialBalance <= 0) {
            throw new WeeklyBudgetInitialBalanceError();
        }
        this.initialBalance = props.initialBalance;
        this.id = props.id;
        this.name = props.name;
        this.startAt = null;
        this.endAt = null;
        this.expenses = props.expenses ?? [];
        this.calculateCurrentBalance();
    }

    addExpense(expense: WeeklyExpense) {
        this.expenses.push(expense);
        this.calculateCurrentBalance();
    }

    checkExpense(expenseId: string) {
        const expense = this.findExpenseById(expenseId);
        expense.check();
        this.calculateCurrentBalance();
    }

    uncheckExpense(expenseId: string) {
        const expense = this.findExpenseById(expenseId);
        expense.uncheck();
        this.calculateCurrentBalance();
    }

    deleteExpenseById(expenseId: string) {
        this.expenses = this.expenses.filter((expense) => expense.id !== expenseId);
        this.calculateCurrentBalance();
    }

    updateExpenseAmount(expenseId: string, amount: number) {
        const expense = this.findExpenseById(expenseId);
        expense.updateAmount(amount);
        this.calculateCurrentBalance();
    }

    updateExpenseLabel(expenseId: string, label: string) {
        const expense = this.findExpenseById(expenseId);
        expense.updateLabel(label);
    }

    findExpenseById(expenseId: string) {
        const expense = this.expenses.find((expense) => expense.id === expenseId);
        if (!expense) {
            throw new WeeklyExpenseNotFoundError();
        }
        return expense;
    }

    get amountForOutflow() {
        let amountForOutflow = 0;
        const sumOfCheckedExpensesAmount = this.expenses.filter((expense) => expense.isChecked)
            .reduce((prev, curr) => prev + curr.amount, 0);
        amountForOutflow = this.initialBalance - sumOfCheckedExpensesAmount;
        if (this.currentBalance <= 0) {
            amountForOutflow -= this.currentBalance;
        }

        return amountForOutflow;
    }

    private calculateCurrentBalance() {
        const sumOfAllExpenses = this.expenses.reduce((prev, curr) => prev + curr.amount, 0);
        this.currentBalance = this.initialBalance - sumOfAllExpenses;
    }
}
