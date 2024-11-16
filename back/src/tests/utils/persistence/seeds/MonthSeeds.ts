import Account from "../../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../../core/models/month/account/WeeklyBudget.js";
import Month from "../../../../core/models/month/Month.js";
import { MonthDao } from "../../../../providers/persistence/entities/Month.js";
import IdProvider from "../../../../providers/IdProvider.js";

const idProvider = new IdProvider();

const props = () => {
  return {
    id: idProvider.get(),
    date: new Date(),
    account: new Account({
      id: idProvider.get(),
      currentBalance: 2000,
      outflows: [
        new AccountOutflow({
          id: idProvider.get(),
          label: "outlfow",
          amount: 10.05,
          isChecked: true,
        }),
      ],
      weeklyBudgets: [
        new WeeklyBudget({
          id: idProvider.get(),
          name: "Semaine 1",
          initialBalance: 200,
        }),
        new WeeklyBudget({
          id: idProvider.get(),
          name: "Semaine 2",
          initialBalance: 200,
        }),
        new WeeklyBudget({
          id: idProvider.get(),
          name: "Semaine 3",
          initialBalance: 200,
        }),
        new WeeklyBudget({
          id: idProvider.get(),
          name: "Semaine 4",
          initialBalance: 200,
        }),
        new WeeklyBudget({
          id: idProvider.get(),
          name: "Semaine 5",
          initialBalance: 200,
        }),
      ],
    }),
  };
};

async function insertArchivedMonth(givenMonth?: Month) {
  const month = givenMonth ?? new Month(props());
  month.isArchived = true;
  const dao = MonthDao.fromDomain(month);
  return await dao.save();
}

async function insertUnarchivedMonth(givenMonth?: Month) {
  const month = givenMonth ?? new Month(props());
  month.isArchived = false;
  const dao = MonthDao.fromDomain(month);
  return await dao.save();
}

export { insertUnarchivedMonth, insertArchivedMonth };
