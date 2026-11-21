import { afterEach, beforeEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import TypeormSavingsAccountRepository from "../../../../../providers/persistence/repositories/SavingsAccountRepository.js";
import { SavingsAccountDao } from "../../../../../providers/persistence/entities/SavingsAccount.js";
import SavingsAccountOperation, {
  SavingsAccountOperationType,
} from "../../../../../core/models/savings-account/SavingsAccountOperation.js";
import IdProvider from "../../../../../providers/IdProvider.js";

const idProvider = new IdProvider();

describe("Integration | Providers | Persistence | Repositories | SavingsAccountRepository", function () {
  const repository = new TypeormSavingsAccountRepository();
  let accountId: string;

  function operation(
    type: SavingsAccountOperationType,
    amount: number,
    date: string,
    id = idProvider.get()
  ) {
    return new SavingsAccountOperation({
      id,
      savingsAccountId: accountId,
      type,
      amount,
      label: null,
      date,
    });
  }

  async function amount() {
    return Number(
      (await SavingsAccountDao.findOneByOrFail({ id: accountId })).amount
    );
  }

  beforeEach(async () => {
    await clearDB();
    accountId = idProvider.get();
    await SavingsAccountDao.create({
      id: accountId,
      name: "Livret A Crédit Agricole",
      amount: 0,
    }).save();
  });

  afterEach(async () => {
    await clearDB();
  });

  it("should recompute the amount when operations are added, edited and deleted", async () => {
    // given
    const initial = operation("deposit", 5000, "2026-10-01");
    const withdrawal = operation("withdrawal", 300.5, "2026-11-10");

    // when / then
    await repository.saveOperation(initial);
    await repository.saveOperation(withdrawal);
    expect(await amount()).to.equal(4699.5);

    await repository.saveOperation(
      operation("withdrawal", 200, "2026-11-10", withdrawal.id)
    );
    expect(await amount()).to.equal(4800);

    await repository.deleteOperation(accountId, withdrawal.id);
    expect(await amount()).to.equal(5000);
  });

  it("should return accounts with their operations sorted by date descending", async () => {
    // given
    await repository.saveOperation(operation("deposit", 100, "2026-10-01"));
    await repository.saveOperation(operation("withdrawal", 20, "2026-11-05"));

    // when
    const [account] = await repository.findAll();

    // then
    expect(account.amount).to.equal(80);
    expect(account.operations.map((o) => o.date)).to.deep.equal([
      "2026-11-05",
      "2026-10-01",
    ]);
  });

  it("should return null for an unknown account", async () => {
    expect(await repository.findById(idProvider.get())).to.be.null;
  });
});
