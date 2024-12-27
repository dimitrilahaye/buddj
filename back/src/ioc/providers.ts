import IdProvider from "../providers/IdProvider.js";
import MonthFactory from "../core/factories/MonthFactory.js";
import WeeklyExpenseFactory from "../core/factories/WeeklyExpenseFactory.js";
import AccountOutflowFactory from "../core/factories/AccountOutflowFactory.js";
import MonthlyOutflowFactory from "../core/factories/MonthlyOutflowFactory.js";
import MonthlyBudgetFactory from "../core/factories/MonthlyBudgetFactory.js";
import YearlySavingFactory from "../core/factories/YearlySavingFactory.js";
import AccountBudgetFactory from "../core/factories/AccountBudgetFactory.js";
import ProjectFactory from "../core/factories/ProjectFactory.js";

const idProvider = new IdProvider();

const monthFactory = new MonthFactory(idProvider);

const weeklyExpenseFactory = new WeeklyExpenseFactory(idProvider);

const outflowFactory = new AccountOutflowFactory(idProvider);

const budgetFactory = new AccountBudgetFactory(idProvider);

const monthlyOutflowFactory = new MonthlyOutflowFactory(idProvider);

const monthlyBudgetFactory = new MonthlyBudgetFactory(idProvider);

const yearlySavingFactory = new YearlySavingFactory(idProvider);

const projectFactory = new ProjectFactory(idProvider);

export {
  idProvider,
  monthFactory,
  weeklyExpenseFactory,
  outflowFactory,
  budgetFactory,
  monthlyOutflowFactory,
  monthlyBudgetFactory,
  yearlySavingFactory,
  projectFactory,
};
