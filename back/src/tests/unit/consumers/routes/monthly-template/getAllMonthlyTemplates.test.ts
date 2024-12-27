import * as http from "node:http";
import request from "supertest";
import {
  authenticate,
  mockedServer,
  expect,
} from "../../../../integration/consumers/test-helpers.js";
import { afterEach } from "mocha";
import * as deps from "../../../../../ioc.js";
import sinon from "sinon";

describe("Integration | Consumers | Routes | GET /months/template", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return all the templates", async function () {
      // given
      const expectedTemplates = ["expectedTemplates"];
      server = mockedServer(
        { isAuthenticated: true },
        {
          ...deps,
          getAllMonthlyTemplatesUsecase: {
            ...deps.getAllMonthlyTemplatesUsecase,
            execute: sinon.stub().resolves(expectedTemplates),
          },
        }
      );
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get("/months/template")
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.deep.equal(expectedTemplates);
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
