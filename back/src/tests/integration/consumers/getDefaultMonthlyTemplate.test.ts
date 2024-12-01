import * as http from "node:http";
import request from "supertest";
import { authenticate, mockedServer, expect } from "./test-helpers.js";
import { afterEach } from "mocha";
import * as deps from "../../../ioc.js";
import sinon from "sinon";
import {
  MonthlyTemplateOutflowsError,
  MonthlyTemplateBudgetError,
} from "../../../core/errors/MonthlyTemplateErrors.js";
import { insertDefaultMonthlyTemplate } from "../../utils/persistence/seeds/MonthlyTemplateSeeds.js";
import { clearDB } from "../providers/test-helpers.js";

describe("Integration | Consumers | Routes | GET /months/template/default", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
      await clearDB();
    });

    it.only("should return data for a new month creation", async function () {
      // given
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      await insertDefaultMonthlyTemplate();

      // when
      const response = await request(server)
        .get("/months/template/default")
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
    });

    it("should return 502 error if month template does not contain 5 weekly budget", async function () {
      // given
      deps.getDefaultMonthlyTemplateUsecase.execute = sinon
        .stub()
        .throwsException(new MonthlyTemplateBudgetError());
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get("/months/template/default")
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(502);
      expect(response.body.success).to.be.false;
    });

    it("should return 502 error if month template does not contain at least 1 outflow", async function () {
      // given
      deps.getDefaultMonthlyTemplateUsecase.execute = sinon
        .stub()
        .throwsException(new MonthlyTemplateOutflowsError());
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get("/months/template/default")
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
      await request(server).get("/months/template/default").expect(401);
    });
  });
});
