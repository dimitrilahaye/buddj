import http from "node:http";
import request from "supertest";
import sinon, { SinonStub } from "sinon";
import { afterEach, beforeEach } from "mocha";
import {
  authenticate,
  expect,
  mockedServer,
} from "../../../../integration/consumers/test-helpers.js";
import * as deps from "../../../../../ioc.js";

describe("Integration | Consumers | Routes | GET /months/archived", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const archivedMonth = Symbol("archivedMonth");
      const months = [archivedMonth];
      const dto = "dto";
      const depsStub = {
        ...deps,
        monthDto: sinon.stub().withArgs(archivedMonth).returns(dto),
      };
      depsStub.getArchivedMonthsUsecase.execute = sinon.stub().resolves(months);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get(`/months/archived`)
        .set("Cookie", cookie);

      // then
      expect(depsStub.getArchivedMonthsUsecase.execute as SinonStub).to.have
        .been.calledOnce;
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.deep.equal([dto]);
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
      await request(server).get("/months/archived").expect(401);
    });
  });
});
