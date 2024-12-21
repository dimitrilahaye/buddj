import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import PendingDebitRepository from "../../../../../providers/persistence/repositories/PendingDebitRepository.js";
import PendingBudget from "../../../../../core/models/pending-debit/PendingBudget.js";
import PendingOutflow from "../../../../../core/models/pending-debit/PendingOutflow.js";
import Month from "../../../../../core/models/month/Month.js";
import Account from "../../../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../../../core/models/month/account/WeeklyBudget.js";
import WeeklyExpense from "../../../../../core/models/month/account/WeeklyExpense.js";
import { MonthDao } from "../../../../../providers/persistence/entities/Month.js";

describe("Integration | Providers | Persistence | Repositories | PendingDebitRepository", () => {
  afterEach(async () => {
    await clearDB();
  });

  describe("#getAll", () => {
    it("should return all pending debits from existing months", async () => {
      // Given
      const repository = new PendingDebitRepository();
      const checkedOutflowFromArchivedMonth = new AccountOutflow({
        id: "e55446c4-8edd-40f0-8820-952cc6d135b2",
        amount: 10,
        label: "JOW",
        isChecked: true,
      });
      const uncheckedOutflowFromArchivedMonth = new AccountOutflow({
        id: "f8f625c9-2d76-4469-9a2b-a3c38ba07685",
        amount: 10,
        label: "JODI",
        isChecked: false,
      });
      const positiveBudgetForArchivedMonth = new WeeklyBudget({
        id: "5ead27cb-b97b-4235-b158-aa564c0e322d",
        initialBalance: 200,
        name: "Vacances",
        expenses: [
          new WeeklyExpense({
            id: "295a1547-d06a-4112-bd49-18c57e8fe7da",
            amount: 5,
            label: "Vaps",
            isChecked: true,
            date: new Date(),
          }),
          new WeeklyExpense({
            id: "ce31d014-6b91-469e-9797-5d29d38760ea",
            amount: 5,
            label: "Resto",
            isChecked: false,
            date: new Date(),
          }),
        ],
      });
      const negativeBudgetForArchivedMonth = new WeeklyBudget({
        id: "eb5a00ec-55a2-4bda-a9dd-35878dbf64f2",
        initialBalance: 200,
        name: "Vacances",
        expenses: [
          new WeeklyExpense({
            id: "a525fe6d-fe1f-4462-8e80-95f62c150ca9",
            amount: 180,
            label: "Vaps",
            isChecked: true,
            date: new Date(),
          }),
          new WeeklyExpense({
            id: "87114c19-d555-4bb5-b969-b0c29525e5c8",
            amount: 30,
            label: "Resto",
            isChecked: false,
            date: new Date(),
          }),
        ],
      });
      const archivedMonth = new Month({
        id: "bd9a84b1-7e5a-477d-88af-bec3098ddfd7",
        date: new Date("2024-02-01"),
        isArchived: true,
        account: new Account({
          id: "e6fd73cb-a385-489e-8e75-fbdb9a9d9414",
          currentBalance: 1000,
          outflows: [
            checkedOutflowFromArchivedMonth,
            uncheckedOutflowFromArchivedMonth,
          ],
          weeklyBudgets: [
            positiveBudgetForArchivedMonth,
            negativeBudgetForArchivedMonth,
          ],
        }),
      });
      await MonthDao.save(MonthDao.fromDomain(archivedMonth));

      const checkedOutflowFromUnarchivedMonth = new AccountOutflow({
        id: "edf76ebc-b124-4966-9f30-8f5294fe21ec",
        amount: 10,
        label: "JOW",
        isChecked: true,
      });
      const uncheckedOutflowFromUnarchivedMonth = new AccountOutflow({
        id: "ca8ffd5b-3d9d-42d5-a5fc-967183a43a68",
        amount: 10,
        label: "JODI",
        isChecked: false,
      });
      const positiveBudgetForUnarchivedMonth = new WeeklyBudget({
        id: "6a4d7d01-88e9-4dca-be39-98b670ffd91b",
        initialBalance: 200,
        name: "Vacances",
        expenses: [
          new WeeklyExpense({
            id: "b62e2c61-419e-4096-820c-301876bb89a0",
            amount: 5,
            label: "Vaps",
            isChecked: true,
            date: new Date(),
          }),
          new WeeklyExpense({
            id: "f0f63029-549e-4980-a96c-bf7b336ccea3",
            amount: 5,
            label: "Resto",
            isChecked: false,
            date: new Date(),
          }),
        ],
      });
      const zeroBudgetForUnarchivedMonth = new WeeklyBudget({
        id: "7b7487c4-aa5f-4f72-a691-1567006e74f0",
        initialBalance: 200,
        name: "Vacances",
        expenses: [
          new WeeklyExpense({
            id: "f942d78f-3e67-4500-86eb-656f09dfe9a8",
            amount: 180,
            label: "Vaps",
            isChecked: true,
            date: new Date(),
          }),
          new WeeklyExpense({
            id: "4b49db4d-3baa-45cc-8cc0-8e8c63b36cc6",
            amount: 20,
            label: "Resto",
            isChecked: false,
            date: new Date(),
          }),
        ],
      });
      const unarchivedMonth = new Month({
        id: "5da6c3fd-c213-45ed-86d4-c9cb3d526efd",
        date: new Date("2024-02-01"),
        isArchived: false,
        account: new Account({
          id: "16e186a0-c834-4e00-8c10-8ebd424e4285",
          currentBalance: 1000,
          outflows: [
            checkedOutflowFromUnarchivedMonth,
            uncheckedOutflowFromUnarchivedMonth,
          ],
          weeklyBudgets: [
            positiveBudgetForUnarchivedMonth,
            zeroBudgetForUnarchivedMonth,
          ],
        }),
      });
      await MonthDao.save(MonthDao.fromDomain(archivedMonth));
      await MonthDao.save(MonthDao.fromDomain(unarchivedMonth));

      // When
      const pendingDebits = await repository.getAll();

      // Then
      pendingDebits.budgets.forEach((budget) => {
        expect(budget).to.be.instanceOf(PendingBudget);
      });
      expect(pendingDebits.budgets).to.have.length(4);

      pendingDebits.outflows.forEach((outflow) => {
        expect(outflow).to.be.instanceOf(PendingOutflow);
      });
      expect(pendingDebits.outflows).to.have.length(2);
    });
  });
});
