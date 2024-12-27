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
import { YearlySavingsAddError } from "../../../../../core/errors/YearlyOutflowsErrors.js";
import DeserializationError from "../../../../../consumers/api/errors/DeserializationError.js";

describe("Integration | Consumers | Routes | POST /yearly-outflows", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const body = {};
      const foundList = Symbol("list");
      const command = Symbol("command");
      const dto = "dto";
      const depsStub = {
        ...deps,
        addYearlyOutflowDeserializer: sinon
          .stub()
          .withArgs(body)
          .returns(command),
        yearlyOutflowsDto: sinon.stub().withArgs(foundList).returns(dto),
      };
      depsStub.addYearlyOutflowUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(foundList);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .post(`/yearly-outflows`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(depsStub.addYearlyOutflowDeserializer as SinonStub).to.have.been
        .calledOnce;
      expect(depsStub.addYearlyOutflowUsecase.execute as SinonStub).to.have.been
        .calledOnce;
      expect(response.statusCode).to.be.equal(201);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.deep.equal(dto);
    });

    describe("when body is malformed", () => {
      it("should throw a 400 error", async function () {
        // given
        const body = {};
        const depsStub = {
          ...deps,
          addYearlyOutflowDeserializer: sinon
            .stub()
            .withArgs(body)
            .throwsException(new DeserializationError("", "")),
        };

        server = mockedServer({ isAuthenticated: true }, depsStub);
        const cookie = await authenticate(server);

        // when
        const response = await request(server)
          .post(`/yearly-outflows`)
          .send(body)
          .set("Cookie", cookie);

        // then
        expect(response.statusCode).to.be.equal(400);
        expect(response.body.success).to.be.false;
      });
    });

    describe("when there is a domain error", () => {
      it("should throw a 422 error", async function () {
        // given
        const body = {};
        const foundList = Symbol("list");
        const command = Symbol("command");
        const dto = "dto";
        const depsStub = {
          ...deps,
          addYearlyOutflowDeserializer: sinon
            .stub()
            .withArgs(body)
            .returns(command),
          yearlyOutflowsDto: sinon.stub().withArgs(foundList).returns(dto),
        };
        depsStub.addYearlyOutflowUsecase.execute = sinon
          .stub()
          .withArgs(command)
          .throwsException(new YearlySavingsAddError());

        server = mockedServer({ isAuthenticated: true }, depsStub);
        const cookie = await authenticate(server);

        // when
        const response = await request(server)
          .post(`/yearly-outflows`)
          .send(body)
          .set("Cookie", cookie);

        // then
        expect(response.statusCode).to.be.equal(422);
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
      await request(server).post(`/yearly-outflows`).expect(401);
    });
  });
});
