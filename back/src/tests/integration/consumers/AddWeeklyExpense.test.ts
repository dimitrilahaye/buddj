import http from "node:http";
import request from "supertest";
import { afterEach, beforeEach } from "mocha";
import { authenticate, expect, mockedServer } from "./test-helpers.js";
import { clearDB } from "../providers/test-helpers.js";
import * as deps from "../../../ioc.js";
import { insertUnarchivedMonth } from "../../utils/persistence/seeds/MonthSeeds.js";
import { WeeklyBudgetDao } from "../../../providers/persistence/entities/WeeklyBudget.js";

describe("Integration | Consumers | Routes | POST /months/{monthId}/weeks/{weekId}/expenses/", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
      await clearDB();
    });

    it("should have persisted new expense and return a month DTO", async function () {
      // given
      const persistedMonth = await insertUnarchivedMonth();
      const monthId = persistedMonth.id;
      const weekId = persistedMonth.account.weeklyBudgets[0].id;
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const body = {
        label: "JOW",
        amount: 10,
      };

      // when
      const response = await request(server)
        .post(`/months/${monthId}/weeks/${weekId}/expenses/`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(201);
      const updatedWeek = await WeeklyBudgetDao.findOne({
        where: { id: weekId },
      });
      if (!updatedWeek) {
        expect.fail("should have found a weekly budget");
        return;
      }
      const addedExpense = updatedWeek.expenses[0];
      expect(addedExpense.label).to.be.equal(body.label);
      expect(Number(addedExpense.amount)).to.be.equal(body.amount);
    });

    it("should return 400 error if body was malformed", async function () {
      // given
      const persistedMonth = await insertUnarchivedMonth();
      const monthId = persistedMonth.id;
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const body = {
        label: "JOW",
        amount: 10,
      };

      // when
      const response = await request(server)
        .post(`/months/${monthId}/weeks/not-an-id/expenses/`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 422 error if core models encountered business error", async function () {
      // given
      const persistedMonth = await insertUnarchivedMonth();
      const monthId = persistedMonth.id;
      const weekId = persistedMonth.account.weeklyBudgets[0].id;
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const body = {
        label: "JOW",
        amount: -10,
      };

      // when
      const response = await request(server)
        .post(`/months/${monthId}/weeks/${weekId}/expenses/`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(422);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const persistedMonth = await insertUnarchivedMonth();
      const monthId = persistedMonth.id;
      const notExistingWeekId = "b16e0d42-b39e-445e-978e-3f744a8e6455";
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const body = {
        label: "JOW",
        amount: 10,
      };

      // when
      const response = await request(server)
        .post(`/months/${monthId}/weeks/${notExistingWeekId}/expenses/`)
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
        .post(
          "/months/85467999-2751-4f04-8d96-7d7727fbff02/weeks/982b2aad-825b-4e8a-986d-8381554637da/expenses/"
        )
        .send({
          label: "JOW",
          amount: 10,
        })
        .expect(401);
    });
  });
});
