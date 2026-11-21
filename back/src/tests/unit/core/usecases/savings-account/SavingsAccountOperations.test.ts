import { beforeEach } from "mocha";
import expect from "../../../../test-helpers.js";
import AddSavingsAccountOperation from "../../../../../core/usecases/savings-account/AddSavingsAccountOperation.js";
import UpdateSavingsAccountOperation from "../../../../../core/usecases/savings-account/UpdateSavingsAccountOperation.js";
import DeleteSavingsAccountOperation from "../../../../../core/usecases/savings-account/DeleteSavingsAccountOperation.js";
import GetSavingsAccountTracker from "../../../../../core/usecases/savings-account/GetSavingsAccountTracker.js";
import GetSavingsAccounts from "../../../../../core/usecases/savings-account/GetSavingsAccounts.js";
import SavingsAccount from "../../../../../core/models/savings-account/SavingsAccount.js";
import SavingsAccountOperation from "../../../../../core/models/savings-account/SavingsAccountOperation.js";
import SavingsAccountTracker from "../../../../../core/models/savings-account/SavingsAccountTracker.js";
import {
  SavingsAccountNotFoundError,
  SavingsAccountOperationAmountMustBePositiveError,
  SavingsAccountOperationNotFoundError,
  SavingsAccountTrackerRangeError,
} from "../../../../../core/errors/SavingsAccountErrors.js";
import {
  idProviderStub,
  resetStubs,
  savingsAccountRepositoryStub,
} from "../test-helpers.js";

const existingOperation = new SavingsAccountOperation({
  id: "operation-id",
  savingsAccountId: "account-id",
  type: "deposit",
  amount: 5000,
  label: "Solde initial",
  date: "2026-11-01",
});

function account(operations: SavingsAccountOperation[] = [existingOperation]) {
  return new SavingsAccount({
    id: "account-id",
    name: "Livret A Crédit Agricole",
    amount: 5000,
    operations,
  });
}

describe("Unit | Core | Usecases | SavingsAccount", function () {
  beforeEach(() => {
    resetStubs();
  });

  describe("GetSavingsAccounts", function () {
    it("should return all savings accounts", async function () {
      // given
      savingsAccountRepositoryStub.findAll.resolves([account()]);

      // when
      const result = await new GetSavingsAccounts(
        savingsAccountRepositoryStub
      ).execute();

      // then
      expect(result).to.deep.equal([account()]);
    });
  });

  describe("AddSavingsAccountOperation", function () {
    it("should save a trimmed operation and return the reloaded account", async function () {
      // given
      idProviderStub.get.returns("new-id");
      const reloaded = account();
      savingsAccountRepositoryStub.findById
        .onFirstCall()
        .resolves(account())
        .onSecondCall()
        .resolves(reloaded);
      const usecase = new AddSavingsAccountOperation(
        idProviderStub,
        savingsAccountRepositoryStub
      );

      // when
      const result = await usecase.execute({
        savingsAccountId: "account-id",
        type: "withdrawal",
        amount: 300,
        label: "   ",
        date: "2026-11-20",
      });

      // then
      expect(savingsAccountRepositoryStub.saveOperation).to.have.been.calledOnce;
      expect(
        savingsAccountRepositoryStub.saveOperation.firstCall.args[0]
      ).to.deep.equal(
        new SavingsAccountOperation({
          id: "new-id",
          savingsAccountId: "account-id",
          type: "withdrawal",
          amount: 300,
          label: null,
          date: "2026-11-20",
        })
      );
      expect(result).to.equal(reloaded);
    });

    it("should reject an unknown account", async function () {
      // given
      savingsAccountRepositoryStub.findById.resolves(null);
      const usecase = new AddSavingsAccountOperation(
        idProviderStub,
        savingsAccountRepositoryStub
      );

      // when / then
      await expect(
        usecase.execute({
          savingsAccountId: "unknown",
          type: "deposit",
          amount: 10,
          label: null,
          date: "2026-11-20",
        })
      ).to.be.rejectedWith(SavingsAccountNotFoundError);
      expect(savingsAccountRepositoryStub.saveOperation).not.to.have.been.called;
    });

    it("should reject a non positive amount", async function () {
      // given
      savingsAccountRepositoryStub.findById.resolves(account());
      const usecase = new AddSavingsAccountOperation(
        idProviderStub,
        savingsAccountRepositoryStub
      );

      // when / then
      await expect(
        usecase.execute({
          savingsAccountId: "account-id",
          type: "deposit",
          amount: 0,
          label: null,
          date: "2026-11-20",
        })
      ).to.be.rejectedWith(SavingsAccountOperationAmountMustBePositiveError);
    });
  });

  describe("UpdateSavingsAccountOperation", function () {
    it("should save the edited operation with its id", async function () {
      // given
      savingsAccountRepositoryStub.findById.resolves(account());
      const usecase = new UpdateSavingsAccountOperation(
        savingsAccountRepositoryStub
      );

      // when
      await usecase.execute({
        savingsAccountId: "account-id",
        operationId: "operation-id",
        type: "deposit",
        amount: 4800,
        label: "Solde initial",
        date: "2026-10-31",
      });

      // then
      expect(
        savingsAccountRepositoryStub.saveOperation.firstCall.args[0]
      ).to.deep.equal(
        new SavingsAccountOperation({
          id: "operation-id",
          savingsAccountId: "account-id",
          type: "deposit",
          amount: 4800,
          label: "Solde initial",
          date: "2026-10-31",
        })
      );
    });

    it("should reject an unknown operation", async function () {
      // given
      savingsAccountRepositoryStub.findById.resolves(account([]));
      const usecase = new UpdateSavingsAccountOperation(
        savingsAccountRepositoryStub
      );

      // when / then
      await expect(
        usecase.execute({
          savingsAccountId: "account-id",
          operationId: "operation-id",
          type: "deposit",
          amount: 1,
          label: null,
          date: "2026-10-31",
        })
      ).to.be.rejectedWith(SavingsAccountOperationNotFoundError);
    });
  });

  describe("DeleteSavingsAccountOperation", function () {
    it("should delete the operation", async function () {
      // given
      savingsAccountRepositoryStub.findById.resolves(account());
      const usecase = new DeleteSavingsAccountOperation(
        savingsAccountRepositoryStub
      );

      // when
      await usecase.execute({
        savingsAccountId: "account-id",
        operationId: "operation-id",
      });

      // then
      expect(
        savingsAccountRepositoryStub.deleteOperation
      ).to.have.been.calledOnceWith("account-id", "operation-id");
    });

    it("should reject an unknown operation", async function () {
      // given
      savingsAccountRepositoryStub.findById.resolves(account([]));
      const usecase = new DeleteSavingsAccountOperation(
        savingsAccountRepositoryStub
      );

      // when / then
      await expect(
        usecase.execute({
          savingsAccountId: "account-id",
          operationId: "operation-id",
        })
      ).to.be.rejectedWith(SavingsAccountOperationNotFoundError);
      expect(savingsAccountRepositoryStub.deleteOperation).not.to.have.been
        .called;
    });
  });

  describe("GetSavingsAccountTracker", function () {
    it("should build the tracker from the account operations", async function () {
      // given
      savingsAccountRepositoryStub.findById.resolves(account());
      const usecase = new GetSavingsAccountTracker(savingsAccountRepositoryStub);

      // when
      const tracker = await usecase.execute({
        savingsAccountId: "account-id",
        granularity: "month",
        from: "2026-11-01",
        to: "2026-11-30",
      });

      // then
      expect(tracker).to.be.instanceOf(SavingsAccountTracker);
      expect(tracker.depositsTotal).to.equal(5000);
      expect(tracker.closingBalance).to.equal(5000);
    });

    it("should reject an inverted range", async function () {
      // given
      const usecase = new GetSavingsAccountTracker(savingsAccountRepositoryStub);

      // when / then
      await expect(
        usecase.execute({
          savingsAccountId: "account-id",
          granularity: "day",
          from: "2026-11-02",
          to: "2026-11-01",
        })
      ).to.be.rejectedWith(SavingsAccountTrackerRangeError);
    });
  });
});
