import http from "node:http";
import request from "supertest";
import sinon, { SinonStub } from "sinon";
import { afterEach, beforeEach } from "mocha";
import {
  authenticate,
  expect,
  mockedServer,
} from "../../../../integration/consumers/test-helpers.js";
import deps from "../../../../../ioc/index.js";
import { YearlySavingsIdDoesNotExistError } from "../../../../../core/errors/YearlyOutflowsErrors.js";
import DeserializationError from "../../../../../consumers/api/errors/DeserializationError.js";

describe("Integration | Consumers | Routes | DELETE /yearly-outflows/:id", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const params = { id: "id" };
      const foundList = Symbol("list");
      const command = Symbol("command");
      const dto = "dto";
      const depsStub = {
        ...deps,
        removeYearlyOutflowDeserializer: sinon
          .stub()
          .withArgs(params)
          .returns(command),
        yearlyOutflowsDto: sinon.stub().withArgs(foundList).returns(dto),
      };
      depsStub.removeYearlyOutflowUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(foundList);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .delete(`/yearly-outflows/${params.id}`)
        .set("Cookie", cookie);

      // then
      expect(depsStub.removeYearlyOutflowDeserializer as SinonStub).to.have.been
        .calledOnce;
      expect(depsStub.removeYearlyOutflowUsecase.execute as SinonStub).to.have
        .been.calledOnce;
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.deep.equal(dto);
    });

    describe("when params is malformed", () => {
      it("should throw a 400 error", async function () {
        // given
        const params = { id: "id" };
        const depsStub = {
          ...deps,
          removeYearlyOutflowDeserializer: sinon
            .stub()
            .withArgs(params)
            .throwsException(new DeserializationError("", "")),
        };

        server = mockedServer({ isAuthenticated: true }, depsStub);
        const cookie = await authenticate(server);

        // when
        const response = await request(server)
          .delete(`/yearly-outflows/${params.id}`)
          .set("Cookie", cookie);

        // then
        expect(response.statusCode).to.be.equal(400);
        expect(response.body.success).to.be.false;
      });
    });

    describe("when there is a domain error", () => {
      it("should throw a 422 error", async function () {
        // given
        const params = { id: "id" };
        const foundList = Symbol("list");
        const command = Symbol("command");
        const dto = "dto";
        const depsStub = {
          ...deps,
          removeYearlyOutflowDeserializer: sinon
            .stub()
            .withArgs(params)
            .returns(command),
          yearlyOutflowsDto: sinon.stub().withArgs(foundList).returns(dto),
        };
        depsStub.removeYearlyOutflowUsecase.execute = sinon
          .stub()
          .withArgs(command)
          .throwsException(new YearlySavingsIdDoesNotExistError());

        server = mockedServer({ isAuthenticated: true }, depsStub);
        const cookie = await authenticate(server);

        // when
        const response = await request(server)
          .delete(`/yearly-outflows/${params.id}`)
          .set("Cookie", cookie);

        // then
        expect(response.statusCode).to.be.equal(404);
        expect(response.body.success).to.be.false;
      });
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
      await request(server).delete(`/yearly-outflows/123`).expect(401);
    });
  });
});
