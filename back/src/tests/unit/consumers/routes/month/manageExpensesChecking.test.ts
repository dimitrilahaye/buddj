import http from "node:http";
import request from "supertest";
import sinon from "sinon";
import { afterEach, beforeEach } from "mocha";
import {
  authenticate,
  expect,
  mockedServer,
} from "../../../../integration/consumers/test-helpers.js";
import * as deps from "../../../../../ioc.js";
import ManageExpensesCheckingCommand from "../../../../../core/commands/ManageExpensesCheckingCommand.js";
import Month from "../../../../../core/models/month/Month.js";
import Account from "../../../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../../../core/models/month/account/WeeklyBudget.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";

describe("Integration | Consumers | Routes | PUT /months/{monthId}/expenses/checking", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command: ManageExpensesCheckingCommand = {
        monthId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
        weeklyBudgets: [
          {
            id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
            expenses: [
              {
                id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
                isChecked: false,
              },
            ],
          },
          {
            id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
            expenses: [
              {
                id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
                isChecked: true,
              },
            ],
          },
        ],
      };
      const updatedMonth = new Month({
        id: "id",
        date: new Date(),
        account: new Account({
          id: "id",
          currentBalance: 2000,
          outflows: [
            new AccountOutflow({
              id: "id",
              label: "label",
              amount: 10,
            }),
          ],
          weeklyBudgets: [
            new WeeklyBudget({
              id: "id",
              name: "Semaine 1",
              initialBalance: 200,
            }),
            new WeeklyBudget({
              id: "id",
              name: "Semaine 2",
              initialBalance: 200,
            }),
            new WeeklyBudget({
              id: "id",
              name: "Semaine 3",
              initialBalance: 200,
            }),
            new WeeklyBudget({
              id: "id",
              name: "Semaine 4",
              initialBalance: 200,
            }),
            new WeeklyBudget({
              id: "id",
              name: "Semaine 5",
              initialBalance: 200,
            }),
          ],
        }),
      });
      deps.manageExpensesCheckingUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(updatedMonth);

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const body = { weeklyBudgets: command.weeklyBudgets };

      // when
      const response = await request(server)
        .put(`/months/${command.monthId}/expenses/checking/`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
    });

    it("should return 400 error if body was malformed", async function () {
      // given
      const command: ManageExpensesCheckingCommand = {
        monthId: "not an id",
        weeklyBudgets: [
          {
            id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
            expenses: [
              {
                id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
                isChecked: false,
              },
            ],
          },
          {
            id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
            expenses: [
              {
                id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
                isChecked: true,
              },
            ],
          },
        ],
      };

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const body = { weeklyBudgets: command.weeklyBudgets };

      // when
      const response = await request(server)
        .put(`/months/${command.monthId}/expenses/checking/`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const command: ManageExpensesCheckingCommand = {
        monthId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
        weeklyBudgets: [
          {
            id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
            expenses: [
              {
                id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
                isChecked: false,
              },
            ],
          },
          {
            id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
            expenses: [
              {
                id: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
                isChecked: true,
              },
            ],
          },
        ],
      };
      deps.manageExpensesCheckingUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .throwsException(new MonthNotFoundError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const body = { weeklyBudgets: command.weeklyBudgets };

      // when
      const response = await request(server)
        .put(`/months/${command.monthId}/expenses/checking/`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(404);
      expect(response.body.success).to.be.false;
    });
  });

  describe("When user is not authenticated", function () {
    beforeEach(async function () {
      server = mockedServer({ isAuthenticated: false }, deps);
    });

    afterEach(function () {
      server.close();
    });

    it("should return a 401 error", async function () {
      await request(server)
        .put("/months/85467999-2751-4f04-8d96-7d7727fbff02/expenses/checking")
        .expect(401);
    });
  });
});
