import * as http from "node:http";
import request from "supertest";
import { authenticate, mockedServer, expect } from "./test-helpers.js";
import { afterEach } from "mocha";
import * as deps from "../../../ioc.js";
import { insertDefaultMonthlyTemplate } from "../../utils/persistence/seeds/MonthlyTemplateSeeds.js";
import { clearDB } from "../providers/test-helpers.js";
import { YearlyOutflowDao } from "../../../providers/persistence/entities/YearlyOutflow.js";

describe("Integration | Consumers | Routes | GET /months/template/default", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
      await clearDB();
    });

    it("should return data for a new month creation", async function () {
      // given
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      await insertDefaultMonthlyTemplate();
      await YearlyOutflowDao.save({
        id: "1377315a-ce7d-486e-8aae-d4b146a5593a",
        label: "label",
        amount: 10,
        month: 2,
      });

      // when
      const response = await request(server)
        .get("/months/template/default")
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
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
