import expect from "../../../../../test-helpers.js";
import AccountOutflow from "../../../../../../core/models/month/account/AccountOutflow.js";
import Account from "../../../../../../core/models/month/account/Account.js";
import {
  AccountOutflowAmountMustBePositiveError,
  AccountOutflowLabelCanNotBeEmptyError,
  AccountOutflowNotFoundError,
} from "../../../../../../core/errors/AccountOuflowErrors.js";

describe("Unit | Core | Models | Month | Account | AccountOutflow#update", function () {
  function outflow() {
    return new AccountOutflow({
      id: "outflow-id",
      label: "EDF",
      amount: 100,
      isChecked: true,
    });
  }

  it("should update label and amount, keeping the checked state", function () {
    const o = outflow();

    o.update("Engie", 120.456);

    expect(o.label).to.equal("Engie");
    expect(o.amount).to.equal(120.46);
    expect(o.isChecked).to.be.true;
  });

  it("should throw if label is empty", function () {
    expect(() => outflow().update("  ", 10)).to.throw(
      AccountOutflowLabelCanNotBeEmptyError
    );
  });

  it("should throw if amount is not positive", function () {
    expect(() => outflow().update("EDF", 0)).to.throw(
      AccountOutflowAmountMustBePositiveError
    );
  });

  describe("Account#updateOutflow", function () {
    it("should update and return the outflow", function () {
      const account = new Account({
        id: "account-id",
        currentBalance: 1000,
        outflows: [outflow()],
        weeklyBudgets: [],
      });

      const updated = account.updateOutflow("outflow-id", "Engie", 90);

      expect(updated).to.equal(account.outflows[0]);
      expect(account.outflows[0]).to.include({ label: "Engie", amount: 90 });
    });

    it("should throw if the outflow does not exist", function () {
      const account = new Account({
        id: "account-id",
        currentBalance: 1000,
        outflows: [],
        weeklyBudgets: [],
      });

      expect(() => account.updateOutflow("unknown", "Engie", 90)).to.throw(
        AccountOutflowNotFoundError
      );
    });
  });
});
