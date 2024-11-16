import * as http from "node:http";
import request from "supertest";
import { authenticate, mockedServer, expect } from "./test-helpers.js";
import { afterEach } from "mocha";
import * as deps from "../../../ioc.js";
import sinon from "sinon";
import {
  MonthCreationOutflowsError,
  MonthCreationTemplateWeeklyBudgetError,
} from "../../../core/errors/MonthCreationTemplateErrors.js";

describe("Integration | Consumers | Routes | GET /months/template", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(function () {
      server.close();
    });

    it("should return data for a new month creation", async function () {
      // given
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get("/months/template")
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
    });

    it("should return 502 error if month template does not contain 5 weekly budget", async function () {
      // given
      deps.getMonthCreationTemplateUsecase.execute = sinon
        .stub()
        .throwsException(new MonthCreationTemplateWeeklyBudgetError());
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get("/months/template")
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(502);
      expect(response.body.success).to.be.false;
    });

    it("should return 502 error if month template does not contain at least 1 outflow", async function () {
      // given
      deps.getMonthCreationTemplateUsecase.execute = sinon
        .stub()
        .throwsException(new MonthCreationOutflowsError());
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get("/months/template")
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(502);
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
      await request(server).get("/months/template").expect(401);
    });
  });
});
