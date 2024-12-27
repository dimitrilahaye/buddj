import env from "../env-vars.js";

import dbClient from "../providers/persistence/db.js";
import typeormDataSource from "../providers/persistence/typeormConfig.js";

import MonthlyTemplateRepository from "../providers/persistence/repositories/MonthlyTemplateRepository.js";
import MonthRepository from "../providers/persistence/repositories/MonthRepository.js";
import PendingDebitRepository from "../providers/persistence/repositories/PendingDebitRepository.js";
import ProjectRepository from "../providers/persistence/repositories/ProjectRepository.js";
import YearlyOutflowRepository from "../providers/persistence/repositories/YearlyOutflowRepository.js";
import MonthlyOutflowTemplateRepository from "../providers/persistence/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyBudgetTemplateRepository from "../providers/persistence/repositories/MonthlyBudgetTemplateRepository.js";
import UserRepository from "../providers/persistence/repositories/UserRepository.js";

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

export {
  client,
  userRepository,
  monthRepository,
  monthlyTemplateRepository,
  monthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository,
  pendingDebitRepository,
  yearlyOutflowRepository,
  projectRepository,
};
