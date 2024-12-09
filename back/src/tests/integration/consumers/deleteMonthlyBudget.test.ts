import * as http from "node:http";
import request from "supertest";
import { authenticate, mockedServer, expect } from "./test-helpers.js";
import { afterEach } from "mocha";
import * as deps from "../../../ioc.js";
import sinon from "sinon";
import DeserializationError from "../../../consumers/api/errors/DeserializationError.js";
import { MonthlyTemplateDoesNotExistError } from "../../../core/errors/MonthlyTemplateErrors.js";

describe("Integration | Consumers | Routes | DELETE /monthly-templates/:templateId/monthly-budgets/:budgetId", function () {
  let server: http.Server;

  afterEach(async function () {
    server.close();
  });

  const params = {
    templateId: "6186fae7-8e54-4de2-bb68-17b7042bd813",
    budgetId: "23e603ab-71f9-46e0-a497-3fbae2154e23",
  };

  describe("When user is authenticated", function () {
    it("should return updated template", async function () {
      // given
      const depsStub = {
        ...deps,
      };
      const updatedTemplate = "updatedTemplate";
      depsStub.deleteMonthlyBudgetUsecase.execute = sinon
        .stub()
        .resolves(updatedTemplate);
      const command = Symbol("command");
      depsStub.deleteMonthlyBudgetDeserializer = sinon.stub().returns(command);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .delete(
          `/monthly-templates/${params.templateId}/monthly-budgets/${params.budgetId}`
        )
        .set("Cookie", cookie);

      // then
      expect(depsStub.deleteMonthlyBudgetDeserializer).to.have.been.calledWith(
        params
      );
      expect(
        depsStub.deleteMonthlyBudgetUsecase.execute
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
      depsStub.deleteMonthlyBudgetDeserializer = sinon
        .stub()
        .throwsException(new DeserializationError("", ""));

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .delete(
          `/monthly-templates/${params.templateId}/monthly-budgets/${params.budgetId}`
        )
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
      depsStub.deleteMonthlyBudgetUsecase.execute = sinon
        .stub()
        .throws(new MonthlyTemplateDoesNotExistError());
      const command = Symbol("command");
      depsStub.deleteMonthlyBudgetDeserializer = sinon.stub().returns(command);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .delete(
          `/monthly-templates/${params.templateId}/monthly-budgets/${params.budgetId}`
        )
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
      await request(server).delete(
        `/monthly-templates/${params.templateId}/monthly-budgets/${params.budgetId}`
      );
    });
  });
});
