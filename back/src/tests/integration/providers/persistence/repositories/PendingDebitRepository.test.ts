import { afterEach } from "mocha";
import expect from "../../../../test-helpers.js";
import { clearDB } from "../../test-helpers.js";
import { insertArchivedMonth } from "../../../../utils/persistence/seeds/MonthSeeds.js";
import MonthBuilder from "../../../../utils/models/MonthBuilder.js";
import AccountOutflow from "../../../../../core/models/month/account/AccountOutflow.js";
import WeeklyExpense from "../../../../../core/models/month/account/WeeklyExpense.js";
import PendingDebitRepository from "../../../../../providers/persistence/repositories/PendingDebitRepository.js";
import PendingDebit from "../../../../../core/models/pending-debit/PendingDebit.js";
import { MonthDao } from "../../../../../providers/persistence/entities/Month.js";

describe("Integration | Providers | Persistence | Repositories | PendingDebitRepository", () => {
  afterEach(async () => {
    await clearDB();
  });

  describe("#getAll", () => {
    it("should return all pending debits from existing months", async () => {
      // Given
      const repository = new PendingDebitRepository();
      const expectedOutflow = new AccountOutflow({
        id: "30db1d8e-0c83-4f11-b504-6addc219d771",
        amount: 10,
        label: "unchecked-outflow-label",
      });
      const expectedExpense = new WeeklyExpense({
        id: "531ab735-b13e-434c-869f-6b2f91bf7ea9",
        amount: 10,
        label: "unchecked-expense-label",
        date: new Date(),
      });
      const monthDate = new Date("2022-01-01");
      const persistedMonth = await insertMonth(
        monthDate,
        expectedOutflow,
        expectedExpense
      );

      // When
      const debits = await repository.getAll();

      // Then
      debits.forEach((debit) => {
        expect(debit).instanceOf(PendingDebit);
      });
      expect(debits).to.have.length(2);
      const outflowDebit = debits.find((debit) => debit.type === "outflow");
      assertDebitEquality(
        outflowDebit,
        expectedOutflow,
        monthDate,
        persistedMonth
      );

      const expenseDebit = debits.find((debit) => debit.type === "expense");
      assertDebitEquality(
        expenseDebit,
        expectedExpense,
        monthDate,
        persistedMonth
      );
    });
  });
});

function assertDebitEquality(
  givenDebit: PendingDebit | undefined,
  expectedDebit: AccountOutflow | WeeklyExpense,
  monthDate: Date,
  persistedMonth: MonthDao
) {
  expect(givenDebit).not.to.be.undefined;
  expect(givenDebit?.id).to.be.equal(expectedDebit.id);
  expect(givenDebit?.amount).to.be.equal(expectedDebit.amount);
  expect(givenDebit?.label).to.be.equal(`${expectedDebit.label} (janv. 2022)`);
  expect(givenDebit?.monthDate.getTime()).to.be.equal(monthDate.getTime());
  expect(givenDebit?.monthId).to.be.equal(persistedMonth.id);
}

async function insertMonth(
  monthDate: Date,
  expectedOutflow: AccountOutflow,
  expectedExpense: WeeklyExpense
) {
  const monthBuilder = new MonthBuilder();
  const month = monthBuilder.add
    .outflow(expectedOutflow)
    .add.outflow(
      new AccountOutflow({
        id: "e024f6e8-3741-43cb-93e0-9eecbe55f4c9",
        amount: 10,
        label: "checked-outflow-label",
        isChecked: true,
      })
    )
    .add.expense(expectedExpense)
    .toWeek("Semaine 1")
    .add.expense(
      new WeeklyExpense({
        id: "5f74814a-0f76-4a1d-a490-eb7882baa21e",
        amount: 10,
        label: "checked-expense-label",
        date: new Date(),
        isChecked: true,
      })
    )
    .toWeek("Semaine 1")
    .get(monthDate);

  return insertArchivedMonth(month);
}
