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
import DeleteExpense from "./core/usecases/DeleteExpense.js";
import UpdateExpense from "./core/usecases/UpdateExpense.js";
import DeleteOutflow from "./core/usecases/DeleteOutflow.js";
import AddOutflow from "./core/usecases/AddOutflow.js";
import AccountOutflowFactory from "./core/factories/AccountOutflowFactory.js";
import GetArchivedMonths from "./core/usecases/GetArchivedMonths.js";
import UnarchiveMonth from "./core/usecases/UnarchiveMonth.js";
import DeleteMonth from "./core/usecases/DeleteMonth.js";
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

// persistence

await typeormDataSource.initialize();

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
  monthCreationTemplateRepository
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

export {
  client as dbClient,
  userRepository,
  monthDto,
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
};
