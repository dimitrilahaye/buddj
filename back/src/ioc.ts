import env from "./env-vars.js";

import dbClient from "./providers/persistence/db.js";
import typeormDataSource from "./providers/persistence/typeormConfig.js";
import UserRepository from "./providers/persistence/repositories/UserRepository.js";
import GetMonthCreationTemplate from "./core/usecases/GetMonthCreationTemplate.js";
import MonthCreationTemplateRepository from "./providers/persistence/repositories/MonthCreationTemplateRepository.js";
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
import monthDto from "./consumers/api/dtos/monthDto.js";
import yearlyOutflowsDto from "./consumers/api/dtos/yearlyOutflowsDto.js";
import DeleteExpense from "./core/usecases/DeleteExpense.js";
import UpdateExpense from "./core/usecases/UpdateExpense.js";
import DeleteOutflow from "./core/usecases/DeleteOutflow.js";
import AddOutflow from "./core/usecases/AddOutflow.js";
import AccountOutflowFactory from "./core/factories/AccountOutflowFactory.js";
import GetArchivedMonths from "./core/usecases/GetArchivedMonths.js";
import UnarchiveMonth from "./core/usecases/UnarchiveMonth.js";
import DeleteMonth from "./core/usecases/DeleteMonth.js";
import TransferBalanceIntoMonth from "./core/usecases/TransferBalanceIntoMonth.js";
import addOutflowDeserializer from "./consumers/api/deserializers/addOutflow.js";
import addWeeklyExpenseDeserializer from "./consumers/api/deserializers/addWeeklyExpense.js";
import archiveMonthDeserializer from "./consumers/api/deserializers/archiveMonth.js";
import deleteExpenseDeserializer from "./consumers/api/deserializers/deleteExpense.js";
import deleteMonthDeserializer from "./consumers/api/deserializers/deleteMonth.js";
import deleteOutflowDeserializer from "./consumers/api/deserializers/deleteOutflow.js";
import monthCreationDeserializer from "./consumers/api/deserializers/monthCreation.js";
import unarchiveMonthDeserializer from "./consumers/api/deserializers/unarchiveMonth.js";
import manageExpenseCheckingDeserializer from "./consumers/api/deserializers/manageExpenseChecking.js";
import manageOutflowCheckingDeserializer from "./consumers/api/deserializers/manageOutflowChecking.js";
import transferBalanceIntoMonthDeserializer from "./consumers/api/deserializers/transferBalanceIntoMonth.js";
import addYearlyOutflowDeserializer from "./consumers/api/deserializers/addYearlyOutflow.js";
import removeYearlyOutflowDeserializer from "./consumers/api/deserializers/removeYearlyOutflow.js";
import PendingDebitRepository from "./providers/persistence/repositories/PendingDebitRepository.js";
import YearlyOutflowRepository from "./providers/persistence/repositories/YearlyOutflowRepository.js";
import GetYearlyOutflows from "./core/usecases/GetYearlyOutflows.js";
import AddYearlyOutflow from "./core/usecases/AddYearlyOutflow.js";
import RemoveYearlyOutflow from "./core/usecases/RemoveYearlyOutflow.js";

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

const monthCreationTemplateRepository = new MonthCreationTemplateRepository();

const pendingDebitRepository = new PendingDebitRepository();

const yearlyOutflowRepository = new YearlyOutflowRepository();

// services

const idProvider = new IdProvider();

const monthFactory = new MonthFactory(idProvider);

const weeklyExpenseFactory = new WeeklyExpenseFactory(idProvider);

const outflowFactory = new AccountOutflowFactory(idProvider);

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

const getMonthCreationTemplateUsecase = new GetMonthCreationTemplate(
  monthCreationTemplateRepository,
  pendingDebitRepository
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

const transferBalanceIntoMonthUsecase = new TransferBalanceIntoMonth(
  monthRepository
);

const getYearlyOutflowsUsecase = new GetYearlyOutflows(yearlyOutflowRepository);

const addYearlyOutflowUsecase = new AddYearlyOutflow(
  yearlyOutflowRepository,
  idProvider
);

const removeYearlyOutflowUsecase = new RemoveYearlyOutflow(
  yearlyOutflowRepository
);

export {
  client as dbClient,
  userRepository,
  monthDto,
  yearlyOutflowsDto,
  getMonthCreationTemplateUsecase,
  createNewMonthUsecase,
  getUnarchivedMonthsUsecase,
  addWeeklyExpenseUsecase,
  manageExpensesCheckingUsecase,
  manageOutflowsCheckingUsecase,
  archiveMonthUsecase,
  deleteExpenseUsecase,
  updateExpenseUsecase,
  deleteOutflowUsecase,
  addOutflowUsecase,
  getArchivedMonthsUsecase,
  unarchiveMonthUsecase,
  deleteMonthUsecase,
  transferBalanceIntoMonthUsecase,
  getYearlyOutflowsUsecase,
  addYearlyOutflowUsecase,
  removeYearlyOutflowUsecase,
  addOutflowDeserializer,
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
};
