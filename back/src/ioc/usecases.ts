import AddBudget from "../core/usecases/month/AddBudget.js";
import AddOutflow from "../core/usecases/month/AddOutflow.js";
import AddWeeklyExpense from "../core/usecases/month/AddWeeklyExpense.js";
import ArchiveMonth from "../core/usecases/month/ArchiveMonth.js";
import CreateNewMonth from "../core/usecases/month/CreateNewMonth.js";
import DeleteExpense from "../core/usecases/month/DeleteExpense.js";
import DeleteMonth from "../core/usecases/month/DeleteMonth.js";
import DeleteOutflow from "../core/usecases/month/DeleteOutflow.js";
import GetArchivedMonths from "../core/usecases/month/GetArchivedMonths.js";
import GetUnarchivedMonths from "../core/usecases/month/GetUnarchivedMonths.js";
import ManageExpensesChecking from "../core/usecases/month/ManageExpensesChecking.js";
import ManageOutflowsChecking from "../core/usecases/month/ManageOutflowsChecking.js";
import RemoveBudget from "../core/usecases/month/RemoveBudget.js";
import TransferBalanceIntoMonth from "../core/usecases/month/TransferBalanceIntoMonth.js";
import UnarchiveMonth from "../core/usecases/month/UnarchiveMonth.js";
import UpdateBudget from "../core/usecases/month/UpdateBudget.js";
import UpdateExpense from "../core/usecases/month/UpdateExpense.js";
import AddMonthlyBudget from "../core/usecases/monthly-template/AddMonthlyBudget.js";
import AddMonthlyOutflow from "../core/usecases/monthly-template/AddMonthlyOutflow.js";
import DeleteMonthlyBudget from "../core/usecases/monthly-template/DeleteMonthlyBudget.js";
import DeleteMonthlyOutflow from "../core/usecases/monthly-template/DeleteMonthlyOutflow.js";
import GetAllMonthlyTemplates from "../core/usecases/monthly-template/GetAllMonthlyTemplates.js";
import GetDefaultMonthlyTemplate from "../core/usecases/monthly-template/GetDefaultMonthlyTemplate.js";
import UpdateMonthlyTemplate from "../core/usecases/monthly-template/UpdateMonthlyTemplate.js";
import AddAmountProject from "../core/usecases/project/AddAmountProject.js";
import CreateProject from "../core/usecases/project/CreateProject.js";
import GetAllProjectsByCategory from "../core/usecases/project/GetAllProjectsByCategory.js";
import GetProject from "../core/usecases/project/GetProject.js";
import ReApplyProject from "../core/usecases/project/ReApplyProject.js";
import RemoveProject from "../core/usecases/project/RemoveProject.js";
import RollbackProject from "../core/usecases/project/RollbackProject.js";
import UpdateProject from "../core/usecases/project/UpdateProject.js";
import AddYearlyOutflow from "../core/usecases/yearly-saving/AddYearlyOutflow.js";
import GetYearlyOutflows from "../core/usecases/yearly-saving/GetYearlyOutflows.js";
import RemoveYearlyOutflow from "../core/usecases/yearly-saving/RemoveYearlyOutflow.js";
import {
  monthRepository,
  monthlyTemplateRepository,
  monthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository,
  pendingDebitRepository,
  yearlyOutflowRepository,
  projectRepository,
} from "./persistence.js";
import {
  monthFactory,
  idProvider,
  monthlyOutflowFactory,
  monthlyBudgetFactory,
  weeklyExpenseFactory,
  outflowFactory,
  budgetFactory,
  yearlySavingFactory,
  projectFactory,
} from "./providers.js";

const createNewMonthUsecase = new CreateNewMonth(monthRepository, monthFactory);

const getUnarchivedMonthsUsecase = new GetUnarchivedMonths(monthRepository);

const getArchivedMonthsUsecase = new GetArchivedMonths(monthRepository);

const manageExpensesCheckingUsecase = new ManageExpensesChecking(
  monthRepository
);

const manageOutflowsCheckingUsecase = new ManageOutflowsChecking(
  monthRepository
);

const getDefaultMonthlyTemplateUsecase = new GetDefaultMonthlyTemplate(
  monthlyTemplateRepository,
  monthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository,
  pendingDebitRepository,
  yearlyOutflowRepository,
  idProvider
);

const getAllMonthlyTemplatesUsecase = new GetAllMonthlyTemplates(
  monthlyTemplateRepository,
  monthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository
);

const updateMonthlyTemplateUsecase = new UpdateMonthlyTemplate(
  monthlyTemplateRepository,
  monthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository
);

const deleteMonthlyOutflowUsecase = new DeleteMonthlyOutflow(
  monthlyTemplateRepository,
  monthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository
);

const deleteMonthlyBudgetUsecase = new DeleteMonthlyBudget(
  monthlyTemplateRepository,
  monthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository
);

const addMonthlyOutflowUsecase = new AddMonthlyOutflow(
  monthlyTemplateRepository,
  monthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository,
  monthlyOutflowFactory
);

const addMonthlyBudgetUsecase = new AddMonthlyBudget(
  monthlyTemplateRepository,
  monthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository,
  monthlyBudgetFactory
);

const addWeeklyExpenseUsecase = new AddWeeklyExpense(
  weeklyExpenseFactory,
  monthRepository
);

const archiveMonthUsecase = new ArchiveMonth(monthRepository);

const unarchiveMonthUsecase = new UnarchiveMonth(monthRepository);

const deleteMonthUsecase = new DeleteMonth(monthRepository);

const deleteExpenseUsecase = new DeleteExpense(monthRepository);

const updateExpenseUsecase = new UpdateExpense(monthRepository);

const deleteOutflowUsecase = new DeleteOutflow(monthRepository);

const addOutflowUsecase = new AddOutflow(outflowFactory, monthRepository);

const addBudgetUsecase = new AddBudget(budgetFactory, monthRepository);

const removeBudgetUsecase = new RemoveBudget(monthRepository);

const updateBudgetUsecase = new UpdateBudget(monthRepository);

const transferBalanceIntoMonthUsecase = new TransferBalanceIntoMonth(
  monthRepository
);

const getYearlyOutflowsUsecase = new GetYearlyOutflows(yearlyOutflowRepository);

const addYearlyOutflowUsecase = new AddYearlyOutflow(
  yearlyOutflowRepository,
  yearlySavingFactory
);

const removeYearlyOutflowUsecase = new RemoveYearlyOutflow(
  yearlyOutflowRepository
);

const addAmountProjectUsecase = new AddAmountProject(projectRepository);

const createProjectUsecase = new CreateProject(
  projectRepository,
  projectFactory
);

const getAllProjectsByCategoryUsecase = new GetAllProjectsByCategory(
  projectRepository
);

const getProjectUsecase = new GetProject(projectRepository);

const reApplyProjectUsecase = new ReApplyProject(projectRepository);

const removeProjectUsecase = new RemoveProject(projectRepository);

const rollbackProjectUsecase = new RollbackProject(projectRepository);

const updateProjectUsecase = new UpdateProject(projectRepository);

export {
  createNewMonthUsecase,
  getUnarchivedMonthsUsecase,
  getArchivedMonthsUsecase,
  manageExpensesCheckingUsecase,
  manageOutflowsCheckingUsecase,
  getDefaultMonthlyTemplateUsecase,
  getAllMonthlyTemplatesUsecase,
  updateMonthlyTemplateUsecase,
  deleteMonthlyOutflowUsecase,
  deleteMonthlyBudgetUsecase,
  addMonthlyOutflowUsecase,
  addMonthlyBudgetUsecase,
  addWeeklyExpenseUsecase,
  archiveMonthUsecase,
  unarchiveMonthUsecase,
  deleteMonthUsecase,
  deleteExpenseUsecase,
  updateExpenseUsecase,
  deleteOutflowUsecase,
  addOutflowUsecase,
  addBudgetUsecase,
  removeBudgetUsecase,
  updateBudgetUsecase,
  transferBalanceIntoMonthUsecase,
  getYearlyOutflowsUsecase,
  addYearlyOutflowUsecase,
  removeYearlyOutflowUsecase,
  addAmountProjectUsecase,
  createProjectUsecase,
  getAllProjectsByCategoryUsecase,
  getProjectUsecase,
  reApplyProjectUsecase,
  removeProjectUsecase,
  rollbackProjectUsecase,
  updateProjectUsecase,
};
