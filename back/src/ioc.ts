import env from "./env-vars.js";

import dbClient from "./providers/persistence/db.js";
import typeormDataSource from "./providers/persistence/typeormConfig.js";
import UserRepository from "./providers/persistence/repositories/UserRepository.js";
import GetDefaultMonthlyTemplate from "./core/usecases/monthly-template/GetDefaultMonthlyTemplate.js";
import MonthlyTemplateRepository from "./providers/persistence/repositories/MonthlyTemplateRepository.js";
import MonthRepository from "./providers/persistence/repositories/MonthRepository.js";
import IdProvider from "./providers/IdProvider.js";
import MonthFactory from "./core/factories/MonthFactory.js";
import CreateNewMonth from "./core/usecases/month/CreateNewMonth.js";
import GetUnarchivedMonths from "./core/usecases/month/GetUnarchivedMonths.js";
import AddWeeklyExpense from "./core/usecases/month/AddWeeklyExpense.js";
import WeeklyExpenseFactory from "./core/factories/WeeklyExpenseFactory.js";
import ManageExpensesChecking from "./core/usecases/month/ManageExpensesChecking.js";
import ManageOutflowsChecking from "./core/usecases/month/ManageOutflowsChecking.js";
import ArchiveMonth from "./core/usecases/month/ArchiveMonth.js";
import monthDto, { MonthDtoBuilder } from "./consumers/api/dtos/monthDto.js";
import yearlyOutflowsDto, {
  YearlyOutflowsDtoBuilder,
} from "./consumers/api/dtos/yearlyOutflowsDto.js";
import DeleteExpense from "./core/usecases/month/DeleteExpense.js";
import UpdateExpense from "./core/usecases/month/UpdateExpense.js";
import DeleteOutflow from "./core/usecases/month/DeleteOutflow.js";
import AddOutflow from "./core/usecases/month/AddOutflow.js";
import AccountOutflowFactory from "./core/factories/AccountOutflowFactory.js";
import GetArchivedMonths from "./core/usecases/month/GetArchivedMonths.js";
import UnarchiveMonth from "./core/usecases/month/UnarchiveMonth.js";
import DeleteMonth from "./core/usecases/month/DeleteMonth.js";
import TransferBalanceIntoMonth from "./core/usecases/month/TransferBalanceIntoMonth.js";
import addOutflowDeserializer, {
  AddOutflowDeserializer,
} from "./consumers/api/deserializers/month/addOutflow.js";
import addWeeklyExpenseDeserializer, {
  AddWeeklyExpenseDeserializer,
} from "./consumers/api/deserializers/month/addWeeklyExpense.js";
import archiveMonthDeserializer, {
  ArchiveMonthDeserializer,
} from "./consumers/api/deserializers/month/archiveMonth.js";
import deleteExpenseDeserializer, {
  DeleteExpenseDeserializer,
} from "./consumers/api/deserializers/month/deleteExpense.js";
import deleteMonthDeserializer, {
  DeleteMonthDeserializer,
} from "./consumers/api/deserializers/month/deleteMonth.js";
import deleteOutflowDeserializer, {
  DeleteOutflowDeserializer,
} from "./consumers/api/deserializers/month/deleteOutflow.js";
import monthCreationDeserializer, {
  MonthCreationDeserializer,
} from "./consumers/api/deserializers/month/monthCreation.js";
import unarchiveMonthDeserializer, {
  UnarchiveMonthDeserializer,
} from "./consumers/api/deserializers/month/unarchiveMonth.js";
import manageExpenseCheckingDeserializer, {
  ManageExpensesCheckingDeserializer,
} from "./consumers/api/deserializers/month/manageExpenseChecking.js";
import manageOutflowCheckingDeserializer, {
  ManageOutflowsCheckingDeserializer,
} from "./consumers/api/deserializers/month/manageOutflowChecking.js";
import updateMonthlyTemplateDeserializer, {
  UpdateMonthlyTemplateDeserializer,
} from "./consumers/api/deserializers/monthly-template/updateMonthlyTemplate.js";
import deleteMonthlyOutflowDeserializer, {
  DeleteMonthlyOutflowDeserializer,
} from "./consumers/api/deserializers/monthly-template/deleteMonthlyOutflow.js";
import deleteMonthlyBudgetDeserializer, {
  DeleteMonthlyBudgetDeserializer,
} from "./consumers/api/deserializers/monthly-template/deleteMonthlyBudget.js";
import transferBalanceIntoMonthDeserializer, {
  TransferBalanceIntoMonthDeserializer,
} from "./consumers/api/deserializers/month/transferBalanceIntoMonth.js";
import addYearlyOutflowDeserializer, {
  AddYearlyOutflowDeserializer,
} from "./consumers/api/deserializers/yearly-saving/addYearlyOutflow.js";
import removeYearlyOutflowDeserializer, {
  RemoveYearlyOutflowDeserializer,
} from "./consumers/api/deserializers/yearly-saving/removeYearlyOutflow.js";
import PendingDebitRepository from "./providers/persistence/repositories/PendingDebitRepository.js";
import ProjectRepository from "./providers/persistence/repositories/ProjectRepository.js";
import YearlyOutflowRepository from "./providers/persistence/repositories/YearlyOutflowRepository.js";
import GetYearlyOutflows from "./core/usecases/yearly-saving/GetYearlyOutflows.js";
import AddYearlyOutflow from "./core/usecases/yearly-saving/AddYearlyOutflow.js";
import RemoveYearlyOutflow from "./core/usecases/yearly-saving/RemoveYearlyOutflow.js";
import MonthlyOutflowTemplateRepository from "./providers/persistence/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyBudgetTemplateRepository from "./providers/persistence/repositories/MonthlyBudgetTemplateRepository.js";
import GetAllMonthlyTemplates from "./core/usecases/monthly-template/GetAllMonthlyTemplates.js";
import UpdateMonthlyTemplate from "./core/usecases/monthly-template/UpdateMonthlyTemplate.js";
import DeleteMonthlyOutflow from "./core/usecases/monthly-template/DeleteMonthlyOutflow.js";
import DeleteMonthlyBudget from "./core/usecases/monthly-template/DeleteMonthlyBudget.js";
import AddMonthlyBudget from "./core/usecases/monthly-template/AddMonthlyBudget.js";
import AddMonthlyOutflow from "./core/usecases/monthly-template/AddMonthlyOutflow.js";
import MonthlyOutflowFactory from "./core/factories/MonthlyOutflowFactory.js";
import MonthlyBudgetFactory from "./core/factories/MonthlyBudgetFactory.js";
import YearlySavingFactory from "./core/factories/YearlySavingFactory.js";
import addMonthlyOutflowDeserializer, {
  AddMonthlyOutflowDeserializer,
} from "./consumers/api/deserializers/monthly-template/addMonthlyOutflow.js";
import addMonthlyBudgetDeserializer, {
  AddMonthlyBudgetDeserializer,
} from "./consumers/api/deserializers/monthly-template/addMonthlyBudget.js";
import AddBudget from "./core/usecases/month/AddBudget.js";
import AccountBudgetFactory from "./core/factories/AccountBudgetFactory.js";
import addBudgetDeserializer, {
  AddBudgetDeserializer,
} from "./consumers/api/deserializers/month/addBudget.js";
import updateBudgetDeserializer, {
  UpdateBudgetDeserializer,
} from "./consumers/api/deserializers/month/updateBudget.js";
import UpdateBudget from "./core/usecases/month/UpdateBudget.js";
import RemoveBudget from "./core/usecases/month/RemoveBudget.js";
import ProjectFactory from "./core/factories/ProjectFactory.js";
import AddAmountProject from "./core/usecases/project/AddAmountProject.js";
import CreateProject from "./core/usecases/project/CreateProject.js";
import GetAllProjectsByCategory from "./core/usecases/project/GetAllProjectsByCategory.js";
import GetProject from "./core/usecases/project/GetProject.js";
import ReApplyProject from "./core/usecases/project/ReApplyProject.js";
import RemoveProject from "./core/usecases/project/RemoveProject.js";
import RollbackProject from "./core/usecases/project/RollbackProject.js";
import UpdateProject from "./core/usecases/project/UpdateProject.js";
import projectDto, {
  ProjectDtoBuilder,
} from "./consumers/api/dtos/projectDto.js";

// persistence

if (process.env.MOCHA_TEST !== "unit") {
  await typeormDataSource.initialize();
}

const client = dbClient({
  user: env.dbUser,
  database: env.dbName,
  port: env.dbPort,
  host: env.dbUrl,
  password: env.dbPassword,
});

const userRepository = new UserRepository(client);

const monthRepository = new MonthRepository();

const monthlyTemplateRepository = new MonthlyTemplateRepository();

const monthlyOutflowTemplateRepository = new MonthlyOutflowTemplateRepository();

const monthlyBudgetTemplateRepository = new MonthlyBudgetTemplateRepository();

const pendingDebitRepository = new PendingDebitRepository();

const yearlyOutflowRepository = new YearlyOutflowRepository();

const projectRepository = new ProjectRepository();

// services

const idProvider = new IdProvider();

const monthFactory = new MonthFactory(idProvider);

const weeklyExpenseFactory = new WeeklyExpenseFactory(idProvider);

const outflowFactory = new AccountOutflowFactory(idProvider);

const budgetFactory = new AccountBudgetFactory(idProvider);

const monthlyOutflowFactory = new MonthlyOutflowFactory(idProvider);

const monthlyBudgetFactory = new MonthlyBudgetFactory(idProvider);

const yearlySavingFactory = new YearlySavingFactory(idProvider);

const projectFactory = new ProjectFactory(idProvider);

// use cases

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

export type Deps = {
  userRepository: UserRepository;
  projectDto: ProjectDtoBuilder;
  monthDto: MonthDtoBuilder;
  yearlyOutflowsDto: YearlyOutflowsDtoBuilder;
  getDefaultMonthlyTemplateUsecase: GetDefaultMonthlyTemplate;
  deleteMonthlyOutflowUsecase: DeleteMonthlyOutflow;
  deleteMonthlyBudgetUsecase: DeleteMonthlyBudget;
  updateMonthlyTemplateUsecase: UpdateMonthlyTemplate;
  getAllMonthlyTemplatesUsecase: GetAllMonthlyTemplates;
  createNewMonthUsecase: CreateNewMonth;
  getUnarchivedMonthsUsecase: GetUnarchivedMonths;
  addWeeklyExpenseUsecase: AddWeeklyExpense;
  manageExpensesCheckingUsecase: ManageExpensesChecking;
  manageOutflowsCheckingUsecase: ManageOutflowsChecking;
  archiveMonthUsecase: ArchiveMonth;
  deleteExpenseUsecase: DeleteExpense;
  updateExpenseUsecase: UpdateExpense;
  deleteOutflowUsecase: DeleteOutflow;
  addOutflowUsecase: AddOutflow;
  addBudgetUsecase: AddBudget;
  removeBudgetUsecase: RemoveBudget;
  updateBudgetUsecase: UpdateBudget;
  getArchivedMonthsUsecase: GetArchivedMonths;
  unarchiveMonthUsecase: UnarchiveMonth;
  deleteMonthUsecase: DeleteMonth;
  addMonthlyOutflowUsecase: AddMonthlyOutflow;
  addMonthlyBudgetUsecase: AddMonthlyBudget;
  transferBalanceIntoMonthUsecase: TransferBalanceIntoMonth;
  getYearlyOutflowsUsecase: GetYearlyOutflows;
  addYearlyOutflowUsecase: AddYearlyOutflow;
  removeYearlyOutflowUsecase: RemoveYearlyOutflow;
  addAmountProjectUsecase: AddAmountProject;
  createProjectUsecase: CreateProject;
  getAllProjectsByCategoryUsecase: GetAllProjectsByCategory;
  getProjectUsecase: GetProject;
  reApplyProjectUsecase: ReApplyProject;
  removeProjectUsecase: RemoveProject;
  rollbackProjectUsecase: RollbackProject;
  updateProjectUsecase: UpdateProject;
  addOutflowDeserializer: AddOutflowDeserializer;
  addBudgetDeserializer: AddBudgetDeserializer;
  updateBudgetDeserializer: UpdateBudgetDeserializer;
  addWeeklyExpenseDeserializer: AddWeeklyExpenseDeserializer;
  archiveMonthDeserializer: ArchiveMonthDeserializer;
  deleteExpenseDeserializer: DeleteExpenseDeserializer;
  deleteMonthDeserializer: DeleteMonthDeserializer;
  deleteOutflowDeserializer: DeleteOutflowDeserializer;
  manageExpenseCheckingDeserializer: ManageExpensesCheckingDeserializer;
  manageOutflowCheckingDeserializer: ManageOutflowsCheckingDeserializer;
  monthCreationDeserializer: MonthCreationDeserializer;
  unarchiveMonthDeserializer: UnarchiveMonthDeserializer;
  transferBalanceIntoMonthDeserializer: TransferBalanceIntoMonthDeserializer;
  addYearlyOutflowDeserializer: AddYearlyOutflowDeserializer;
  removeYearlyOutflowDeserializer: RemoveYearlyOutflowDeserializer;
  updateMonthlyTemplateDeserializer: UpdateMonthlyTemplateDeserializer;
  deleteMonthlyOutflowDeserializer: DeleteMonthlyOutflowDeserializer;
  deleteMonthlyBudgetDeserializer: DeleteMonthlyBudgetDeserializer;
  addMonthlyOutflowDeserializer: AddMonthlyOutflowDeserializer;
  addMonthlyBudgetDeserializer: AddMonthlyBudgetDeserializer;
};

export {
  client as dbClient,
  userRepository,
  monthDto,
  yearlyOutflowsDto,
  projectDto,
  getDefaultMonthlyTemplateUsecase,
  updateMonthlyTemplateUsecase,
  deleteMonthlyOutflowUsecase,
  deleteMonthlyBudgetUsecase,
  getAllMonthlyTemplatesUsecase,
  createNewMonthUsecase,
  getUnarchivedMonthsUsecase,
  addWeeklyExpenseUsecase,
  manageExpensesCheckingUsecase,
  manageOutflowsCheckingUsecase,
  addMonthlyOutflowUsecase,
  addMonthlyBudgetUsecase,
  archiveMonthUsecase,
  deleteExpenseUsecase,
  updateExpenseUsecase,
  updateBudgetUsecase,
  deleteOutflowUsecase,
  addOutflowUsecase,
  addBudgetUsecase,
  getArchivedMonthsUsecase,
  unarchiveMonthUsecase,
  deleteMonthUsecase,
  transferBalanceIntoMonthUsecase,
  getYearlyOutflowsUsecase,
  addYearlyOutflowUsecase,
  removeYearlyOutflowUsecase,
  removeBudgetUsecase,
  addAmountProjectUsecase,
  createProjectUsecase,
  getAllProjectsByCategoryUsecase,
  getProjectUsecase,
  reApplyProjectUsecase,
  removeProjectUsecase,
  rollbackProjectUsecase,
  updateProjectUsecase,
  addOutflowDeserializer,
  addBudgetDeserializer,
  updateBudgetDeserializer,
  addWeeklyExpenseDeserializer,
  archiveMonthDeserializer,
  deleteExpenseDeserializer,
  deleteMonthDeserializer,
  deleteOutflowDeserializer,
  manageExpenseCheckingDeserializer,
  manageOutflowCheckingDeserializer,
  monthCreationDeserializer,
  unarchiveMonthDeserializer,
  transferBalanceIntoMonthDeserializer,
  addYearlyOutflowDeserializer,
  removeYearlyOutflowDeserializer,
  updateMonthlyTemplateDeserializer,
  deleteMonthlyOutflowDeserializer,
  deleteMonthlyBudgetDeserializer,
  addMonthlyOutflowDeserializer,
  addMonthlyBudgetDeserializer,
};
