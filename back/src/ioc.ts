import env from "./env-vars.js";

import dbClient from "./providers/persistence/db.js";
import typeormDataSource from "./providers/persistence/typeormConfig.js";
import UserRepository from "./providers/persistence/repositories/UserRepository.js";
import GetDefaultMonthlyTemplate from "./core/usecases/GetDefaultMonthlyTemplate.js";
import MonthlyTemplateRepository from "./providers/persistence/repositories/MonthlyTemplateRepository.js";
import MonthRepository from "./providers/persistence/repositories/MonthRepository.js";
import IdProvider from "./providers/IdProvider.js";
import MonthFactory from "./core/factories/MonthFactory.js";
import CreateNewMonth from "./core/usecases/CreateNewMonth.js";
import GetUnarchivedMonths from "./core/usecases/GetUnarchivedMonths.js";
import AddWeeklyExpense from "./core/usecases/AddWeeklyExpense.js";
import WeeklyExpenseFactory from "./core/factories/WeeklyExpenseFactory.js";
import ManageExpensesChecking from "./core/usecases/ManageExpensesChecking.js";
import ManageOutflowsChecking from "./core/usecases/ManageOutflowsChecking.js";
import ArchiveMonth from "./core/usecases/ArchiveMonth.js";
import monthDto, { MonthDtoBuilder } from "./consumers/api/dtos/monthDto.js";
import yearlyOutflowsDto, {
  YearlyOutflowsDtoBuilder,
} from "./consumers/api/dtos/yearlyOutflowsDto.js";
import DeleteExpense from "./core/usecases/DeleteExpense.js";
import UpdateExpense from "./core/usecases/UpdateExpense.js";
import DeleteOutflow from "./core/usecases/DeleteOutflow.js";
import AddOutflow from "./core/usecases/AddOutflow.js";
import AccountOutflowFactory from "./core/factories/AccountOutflowFactory.js";
import GetArchivedMonths from "./core/usecases/GetArchivedMonths.js";
import UnarchiveMonth from "./core/usecases/UnarchiveMonth.js";
import DeleteMonth from "./core/usecases/DeleteMonth.js";
import TransferBalanceIntoMonth from "./core/usecases/TransferBalanceIntoMonth.js";
import addOutflowDeserializer, {
  AddOutflowDeserializer,
} from "./consumers/api/deserializers/addOutflow.js";
import addWeeklyExpenseDeserializer, {
  AddWeeklyExpenseDeserializer,
} from "./consumers/api/deserializers/addWeeklyExpense.js";
import archiveMonthDeserializer, {
  ArchiveMonthDeserializer,
} from "./consumers/api/deserializers/archiveMonth.js";
import deleteExpenseDeserializer, {
  DeleteExpenseDeserializer,
} from "./consumers/api/deserializers/deleteExpense.js";
import deleteMonthDeserializer, {
  DeleteMonthDeserializer,
} from "./consumers/api/deserializers/deleteMonth.js";
import deleteOutflowDeserializer, {
  DeleteOutflowDeserializer,
} from "./consumers/api/deserializers/deleteOutflow.js";
import monthCreationDeserializer, {
  MonthCreationDeserializer,
} from "./consumers/api/deserializers/monthCreation.js";
import unarchiveMonthDeserializer, {
  UnarchiveMonthDeserializer,
} from "./consumers/api/deserializers/unarchiveMonth.js";
import manageExpenseCheckingDeserializer, {
  ManageExpensesCheckingDeserializer,
} from "./consumers/api/deserializers/manageExpenseChecking.js";
import manageOutflowCheckingDeserializer, {
  ManageOutflowsCheckingDeserializer,
} from "./consumers/api/deserializers/manageOutflowChecking.js";
import updateMonthlyTemplateDeserializer, {
  UpdateMonthlyTemplateDeserializer,
} from "./consumers/api/deserializers/updateMonthlyTemplate.js";
import deleteMonthlyOutflowDeserializer, {
  DeleteMonthlyOutflowDeserializer,
} from "./consumers/api/deserializers/deleteMonthlyOutflow.js";
import deleteMonthlyBudgetDeserializer, {
  DeleteMonthlyBudgetDeserializer,
} from "./consumers/api/deserializers/deleteMonthlyBudget.js";
import transferBalanceIntoMonthDeserializer, {
  TransferBalanceIntoMonthDeserializer,
} from "./consumers/api/deserializers/transferBalanceIntoMonth.js";
import addYearlyOutflowDeserializer, {
  AddYearlyOutflowDeserializer,
} from "./consumers/api/deserializers/addYearlyOutflow.js";
import removeYearlyOutflowDeserializer, {
  RemoveYearlyOutflowDeserializer,
} from "./consumers/api/deserializers/removeYearlyOutflow.js";
import PendingDebitRepository from "./providers/persistence/repositories/PendingDebitRepository.js";
import ProjectRepository from "./providers/persistence/repositories/ProjectRepository.js";
import YearlyOutflowRepository from "./providers/persistence/repositories/YearlyOutflowRepository.js";
import GetYearlyOutflows from "./core/usecases/GetYearlyOutflows.js";
import AddYearlyOutflow from "./core/usecases/AddYearlyOutflow.js";
import RemoveYearlyOutflow from "./core/usecases/RemoveYearlyOutflow.js";
import MonthlyOutflowTemplateRepository from "./providers/persistence/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyBudgetTemplateRepository from "./providers/persistence/repositories/MonthlyBudgetTemplateRepository.js";
import GetAllMonthlyTemplates from "./core/usecases/GetAllMonthlyTemplates.js";
import UpdateMonthlyTemplate from "./core/usecases/UpdateMonthlyTemplate.js";
import DeleteMonthlyOutflow from "./core/usecases/DeleteMonthlyOutflow.js";
import DeleteMonthlyBudget from "./core/usecases/DeleteMonthlyBudget.js";
import AddMonthlyBudget from "./core/usecases/AddMonthlyBudget.js";
import AddMonthlyOutflow from "./core/usecases/AddMonthlyOutflow.js";
import MonthlyOutflowFactory from "./core/factories/MonthlyOutflowFactory.js";
import MonthlyBudgetFactory from "./core/factories/MonthlyBudgetFactory.js";
import YearlySavingFactory from "./core/factories/YearlySavingFactory.js";
import addMonthlyOutflowDeserializer, {
  AddMonthlyOutflowDeserializer,
} from "./consumers/api/deserializers/addMonthlyOutflow.js";
import addMonthlyBudgetDeserializer, {
  AddMonthlyBudgetDeserializer,
} from "./consumers/api/deserializers/addMonthlyBudget.js";
import AddBudget from "./core/usecases/AddBudget.js";
import AccountBudgetFactory from "./core/factories/AccountBudgetFactory.js";
import addBudgetDeserializer, {
  AddBudgetDeserializer,
} from "./consumers/api/deserializers/addBudget.js";
import updateBudgetDeserializer, {
  UpdateBudgetDeserializer,
} from "./consumers/api/deserializers/updateBudget.js";
import UpdateBudget from "./core/usecases/UpdateBudget.js";
import RemoveBudget from "./core/usecases/RemoveBudget.js";
import ProjectFactory from "./core/factories/ProjectFactory.js";
import AddAmountProject from "./core/usecases/AddAmountProject.js";
import CreateProject from "./core/usecases/CreateProject.js";
import GetAllProjectsByCategory from "./core/usecases/GetAllProjectsByCategory.js";
import GetProject from "./core/usecases/GetProject.js";
import ReApplyProject from "./core/usecases/ReApplyProject.js";
import RemoveProject from "./core/usecases/RemoveProject.js";
import RollbackProject from "./core/usecases/RollbackProject.js";
import UpdateProject from "./core/usecases/UpdateProject.js";
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
