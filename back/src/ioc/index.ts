import UserRepository from "../providers/persistence/repositories/UserRepository.js";
import GetDefaultMonthlyTemplate from "../core/usecases/monthly-template/GetDefaultMonthlyTemplate.js";
import CreateNewMonth from "../core/usecases/month/CreateNewMonth.js";
import GetUnarchivedMonths from "../core/usecases/month/GetUnarchivedMonths.js";
import AddWeeklyExpense from "../core/usecases/month/AddWeeklyExpense.js";
import ManageExpensesChecking from "../core/usecases/month/ManageExpensesChecking.js";
import ManageOutflowsChecking from "../core/usecases/month/ManageOutflowsChecking.js";
import ArchiveMonth from "../core/usecases/month/ArchiveMonth.js";
import monthDto, { MonthDtoBuilder } from "../consumers/api/dtos/monthDto.js";
import yearlyOutflowsDto, {
  YearlyOutflowsDtoBuilder,
} from "../consumers/api/dtos/yearlyOutflowsDto.js";
import DeleteExpense from "../core/usecases/month/DeleteExpense.js";
import UpdateExpense from "../core/usecases/month/UpdateExpense.js";
import DeleteOutflow from "../core/usecases/month/DeleteOutflow.js";
import AddOutflow from "../core/usecases/month/AddOutflow.js";
import GetArchivedMonths from "../core/usecases/month/GetArchivedMonths.js";
import UnarchiveMonth from "../core/usecases/month/UnarchiveMonth.js";
import DeleteMonth from "../core/usecases/month/DeleteMonth.js";
import TransferBalanceIntoMonth from "../core/usecases/month/TransferBalanceIntoMonth.js";
import addOutflowDeserializer, {
  AddOutflowDeserializer,
} from "../consumers/api/deserializers/month/addOutflow.js";
import addWeeklyExpenseDeserializer, {
  AddWeeklyExpenseDeserializer,
} from "../consumers/api/deserializers/month/addWeeklyExpense.js";
import archiveMonthDeserializer, {
  ArchiveMonthDeserializer,
} from "../consumers/api/deserializers/month/archiveMonth.js";
import deleteExpenseDeserializer, {
  DeleteExpenseDeserializer,
} from "../consumers/api/deserializers/month/deleteExpense.js";
import deleteMonthDeserializer, {
  DeleteMonthDeserializer,
} from "../consumers/api/deserializers/month/deleteMonth.js";
import deleteOutflowDeserializer, {
  DeleteOutflowDeserializer,
} from "../consumers/api/deserializers/month/deleteOutflow.js";
import monthCreationDeserializer, {
  MonthCreationDeserializer,
} from "../consumers/api/deserializers/month/monthCreation.js";
import unarchiveMonthDeserializer, {
  UnarchiveMonthDeserializer,
} from "../consumers/api/deserializers/month/unarchiveMonth.js";
import manageExpenseCheckingDeserializer, {
  ManageExpensesCheckingDeserializer,
} from "../consumers/api/deserializers/month/manageExpenseChecking.js";
import manageOutflowCheckingDeserializer, {
  ManageOutflowsCheckingDeserializer,
} from "../consumers/api/deserializers/month/manageOutflowChecking.js";
import updateMonthlyTemplateDeserializer, {
  UpdateMonthlyTemplateDeserializer,
} from "../consumers/api/deserializers/monthly-template/updateMonthlyTemplate.js";
import deleteMonthlyOutflowDeserializer, {
  DeleteMonthlyOutflowDeserializer,
} from "../consumers/api/deserializers/monthly-template/deleteMonthlyOutflow.js";
import deleteMonthlyBudgetDeserializer, {
  DeleteMonthlyBudgetDeserializer,
} from "../consumers/api/deserializers/monthly-template/deleteMonthlyBudget.js";
import transferBalanceIntoMonthDeserializer, {
  TransferBalanceIntoMonthDeserializer,
} from "../consumers/api/deserializers/month/transferBalanceIntoMonth.js";
import addYearlyOutflowDeserializer, {
  AddYearlyOutflowDeserializer,
} from "../consumers/api/deserializers/yearly-saving/addYearlyOutflow.js";
import removeYearlyOutflowDeserializer, {
  RemoveYearlyOutflowDeserializer,
} from "../consumers/api/deserializers/yearly-saving/removeYearlyOutflow.js";
import GetYearlyOutflows from "../core/usecases/yearly-saving/GetYearlyOutflows.js";
import AddYearlyOutflow from "../core/usecases/yearly-saving/AddYearlyOutflow.js";
import RemoveYearlyOutflow from "../core/usecases/yearly-saving/RemoveYearlyOutflow.js";
import GetAllMonthlyTemplates from "../core/usecases/monthly-template/GetAllMonthlyTemplates.js";
import UpdateMonthlyTemplate from "../core/usecases/monthly-template/UpdateMonthlyTemplate.js";
import DeleteMonthlyOutflow from "../core/usecases/monthly-template/DeleteMonthlyOutflow.js";
import DeleteMonthlyBudget from "../core/usecases/monthly-template/DeleteMonthlyBudget.js";
import AddMonthlyBudget from "../core/usecases/monthly-template/AddMonthlyBudget.js";
import AddMonthlyOutflow from "../core/usecases/monthly-template/AddMonthlyOutflow.js";
import addMonthlyOutflowDeserializer, {
  AddMonthlyOutflowDeserializer,
} from "../consumers/api/deserializers/monthly-template/addMonthlyOutflow.js";
import addMonthlyBudgetDeserializer, {
  AddMonthlyBudgetDeserializer,
} from "../consumers/api/deserializers/monthly-template/addMonthlyBudget.js";
import AddBudget from "../core/usecases/month/AddBudget.js";
import addBudgetDeserializer, {
  AddBudgetDeserializer,
} from "../consumers/api/deserializers/month/addBudget.js";
import updateBudgetDeserializer, {
  UpdateBudgetDeserializer,
} from "../consumers/api/deserializers/month/updateBudget.js";
import UpdateBudget from "../core/usecases/month/UpdateBudget.js";
import RemoveBudget from "../core/usecases/month/RemoveBudget.js";
import AddAmountProject from "../core/usecases/project/AddAmountProject.js";
import CreateProject from "../core/usecases/project/CreateProject.js";
import GetAllProjectsByCategory from "../core/usecases/project/GetAllProjectsByCategory.js";
import GetProject from "../core/usecases/project/GetProject.js";
import ReApplyProject from "../core/usecases/project/ReApplyProject.js";
import RemoveProject from "../core/usecases/project/RemoveProject.js";
import RollbackProject from "../core/usecases/project/RollbackProject.js";
import UpdateProject from "../core/usecases/project/UpdateProject.js";
import projectDto, {
  ProjectDtoBuilder,
} from "../consumers/api/dtos/projectDto.js";
import { client, userRepository } from "./persistence.js";
import * as usecases from "./usecases.js";

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

export default {
  ...usecases,
  dbClient: client,
  userRepository,
  monthDto,
  yearlyOutflowsDto,
  projectDto,
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
} as const;
