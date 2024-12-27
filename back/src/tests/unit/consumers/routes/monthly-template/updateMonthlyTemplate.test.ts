import * as http from "node:http";
import request from "supertest";
import {
  authenticate,
  mockedServer,
  expect,
} from "../../../../integration/consumers/test-helpers.js";
import { afterEach } from "mocha";
import deps from "../../../../../ioc/index.js";
import sinon from "sinon";
import DeserializationError from "../../../../../consumers/api/errors/DeserializationError.js";
import {
  MonthlyTemplateDoesNotExistError,
  MonthlyTemplateNameCanNotBeEmptyError,
} from "../../../../../core/errors/MonthlyTemplateErrors.js";

describe("Integration | Consumers | Routes | PATCH /monthly-templates/:id", function () {
  let server: http.Server;

  afterEach(async function () {
    server.close();
  });

  const body = { name: "newName", isDefault: true };
  const params = { id: "6186fae7-8e54-4de2-bb68-17b7042bd813" };

  describe("When user is authenticated", function () {
    it("should return updated template", async function () {
      // given
      const depsStub = {
        ...deps,
      };
      const updatedTemplate = "updatedTemplate";
      depsStub.updateMonthlyTemplateUsecase.execute = sinon
        .stub()
        .resolves(updatedTemplate);
      const command = Symbol("command");
      depsStub.updateMonthlyTemplateDeserializer = sinon
        .stub()
        .returns(command);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/monthly-templates/${params.id}`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(
        depsStub.updateMonthlyTemplateDeserializer
      ).to.have.been.calledWith(params, body);
      expect(
        depsStub.updateMonthlyTemplateUsecase.execute
      ).to.have.been.calledWith(command);
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(updatedTemplate);
    });

    it("should return 400 error if request is malformed", async () => {
      // given
      const depsStub = {
        ...deps,
      };
      depsStub.updateMonthlyTemplateDeserializer = sinon
        .stub()
        .throwsException(new DeserializationError("", ""));

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/monthly-templates/${params.id}`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if template is not found", async () => {
      // given
      const depsStub = {
        ...deps,
      };
      depsStub.updateMonthlyTemplateUsecase.execute = sinon
        .stub()
        .throws(new MonthlyTemplateDoesNotExistError());
      const command = Symbol("command");
      depsStub.updateMonthlyTemplateDeserializer = sinon
        .stub()
        .returns(command);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/monthly-templates/${params.id}`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(404);
      expect(response.body.success).to.be.false;
    });

    it("should return 422 error if entity is unprocessabled", async () => {
      // given
      const depsStub = {
        ...deps,
      };
      depsStub.updateMonthlyTemplateUsecase.execute = sinon
        .stub()
        .throws(new MonthlyTemplateNameCanNotBeEmptyError());
      const command = Symbol("command");
      depsStub.updateMonthlyTemplateDeserializer = sinon
        .stub()
        .returns(command);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/monthly-templates/${params.id}`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(422);
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
      await request(server).patch(`/monthly-templates/${params.id}`).send(body);
    });
  });
});
