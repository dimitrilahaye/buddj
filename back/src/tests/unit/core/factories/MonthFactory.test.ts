import expect from "../../../test-helpers.js";
import sinon from "sinon";
import Month from "../../../../core/models/month/Month.js";
import MonthFactory from "../../../../core/factories/MonthFactory.js";
import { AccountInitialBalanceError } from "../../../../core/errors/AccountErrors.js";
import { PendingDebitProps } from "../../../../core/models/pending-debit/PendingDebit.js";

describe("Unit | Core | Factories | MonthFactory", function () {
  describe("#create", function () {
    it("should give a month with right data", function () {
      // given
      const idProvider = {
        get: sinon.stub<any, string>(),
      };
      idProvider.get.returns("uuid");

      const factory = new MonthFactory(idProvider);
      const command = {
        date: new Date(),
        initialBalance: 2000,
        pendingDebits: [
          {
            id: "8d2eead7-f41d-4e6c-9c52-d0f81c22a21b",
            monthId: "a8ac22b1-0090-494a-a3fe-9ec2526cf8d1",
            monthDate: new Date(),
            label: "label",
            amount: 10,
            type: "outflow",
          } as PendingDebitProps,
        ],
        outflows: [
          {
            label: "outlfow",
            amount: 10.05,
          },
        ],
        weeklyBudgets: [
          {
            name: "Semaine 1",
            initialBalance: 200,
          },
          {
            name: "Semaine 2",
            initialBalance: 200,
          },
          {
            name: "Semaine 3",
            initialBalance: 200,
          },
          {
            name: "Semaine 4",
            initialBalance: 200,
          },
          {
            name: "Semaine 5",
            initialBalance: 200,
          },
        ],
      };

      // when
      const month = factory.create(command);

      // then
      expect(month).to.be.instanceof(Month);
      expect(month.account.outflows).to.have.lengthOf(2);
      expect(month.account.weeklyBudgets).to.have.lengthOf(5);
    });
    it("should throw an error if current balance is negative", function () {
      // given
      const idProvider = {
        get: sinon.stub<any, string>(),
      };
      idProvider.get.returns("uuid");

      const factory = new MonthFactory(idProvider);
      const command = {
        date: new Date(),
        initialBalance: -2000,
        pendingDebits: [
          {
            id: "8d2eead7-f41d-4e6c-9c52-d0f81c22a21b",
            monthId: "a8ac22b1-0090-494a-a3fe-9ec2526cf8d1",
            monthDate: new Date(),
            label: "label",
            amount: 10,
            type: "outflow",
          } as PendingDebitProps,
        ],
        outflows: [
          {
            label: "outlfow",
            amount: 10.05,
          },
        ],
        weeklyBudgets: [
          {
            name: "Semaine 1",
            initialBalance: 200,
          },
          {
            name: "Semaine 2",
            initialBalance: 200,
          },
          {
            name: "Semaine 3",
            initialBalance: 200,
          },
          {
            name: "Semaine 4",
            initialBalance: 200,
          },
          {
            name: "Semaine 5",
            initialBalance: 200,
          },
        ],
      };

      // when / then
      expect(() => factory.create(command)).to.throw(
        AccountInitialBalanceError
      );
    });
    it("should throw an error if current balance is 0", function () {
      // given
      const idProvider = {
        get: sinon.stub<any, string>(),
      };
      idProvider.get.returns("uuid");

      const factory = new MonthFactory(idProvider);
      const command = {
        date: new Date(),
        initialBalance: 0,
        pendingDebits: [
          {
            id: "8d2eead7-f41d-4e6c-9c52-d0f81c22a21b",
            monthId: "a8ac22b1-0090-494a-a3fe-9ec2526cf8d1",
            monthDate: new Date(),
            label: "label",
            amount: 10,
            type: "outflow",
          } as PendingDebitProps,
        ],
        outflows: [
          {
            label: "outlfow",
            amount: 10.05,
          },
        ],
        weeklyBudgets: [
          {
            name: "Semaine 1",
            initialBalance: 200,
          },
          {
            name: "Semaine 2",
            initialBalance: 200,
          },
          {
            name: "Semaine 3",
            initialBalance: 200,
          },
          {
            name: "Semaine 4",
            initialBalance: 200,
          },
          {
            name: "Semaine 5",
            initialBalance: 200,
          },
        ],
      };

      // when / then
      expect(() => factory.create(command)).to.throw(
        AccountInitialBalanceError
      );
    });
  });
});
