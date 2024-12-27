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
import { AddMonthlyOutflowCommand } from "../../../../../core/usecases/monthly-template/AddMonthlyOutflow.js";
import { Deps } from "../../../../../ioc.js";
import {
  MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError,
  MonthlyOutflowTemplateLabelCanNotBeEmptyError,
  MonthlyTemplateDoesNotExistError,
} from "../../../../../core/errors/MonthlyTemplateErrors.js";

describe("Integration | Consumers | Routes | POST /monthly-templates/:templateId/monthly-outflows", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command: AddMonthlyOutflowCommand = {
        templateId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        label: "JOW",
        amount: 10,
      };
      const updatedTemplate = "updatedTemplate";
      const depsStub: Deps = {
        ...deps,
        addMonthlyOutflowDeserializer: sinon
          .stub()
          .withArgs(
            { templateId: command.templateId },
            { label: command.label, amount: command.amount }
          )
          .returns(command),
      };
      depsStub.addMonthlyOutflowUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(updatedTemplate);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const { templateId, ...body } = command;

      // when
      const response = await request(server)
        .post(`/monthly-templates/${templateId}/monthly-outflows`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(
        (depsStub.addMonthlyOutflowDeserializer as SinonStub).args
      ).to.deep.equal([
        [
          { templateId: command.templateId },
          { label: command.label, amount: command.amount },
        ],
      ]);
      expect(
        (depsStub.addMonthlyOutflowUsecase.execute as SinonStub).args
      ).to.deep.equal([[command]]);
      expect(response.statusCode).to.be.equal(201);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(updatedTemplate);
    });

    it("should return 400 error if body was malformed", async function () {
      // given
      const command: AddMonthlyOutflowCommand = {
        templateId: "not-an-id",
        label: "JOW",
        amount: 10,
      };

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { templateId, ...body } = command;

      // when
      const response = await request(server)
        .post(`/monthly-templates/${templateId}/monthly-outflows`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const command: AddMonthlyOutflowCommand = {
        templateId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        label: "JOW",
        amount: 10,
      };
      deps.addMonthlyOutflowUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .throwsException(new MonthlyTemplateDoesNotExistError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { templateId, ...body } = command;

      // when
      const response = await request(server)
        .post(`/monthly-templates/${templateId}/monthly-outflows`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(404);
      expect(response.body.success).to.be.false;
    });

    describe("it should return 422 error", () => {
      it("when amount is 0 or less", async function () {
        // given
        const command: AddMonthlyOutflowCommand = {
          templateId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
          label: "JOW",
          amount: 0,
        };
        deps.addMonthlyOutflowUsecase.execute = sinon
          .stub()
          .withArgs(command)
          .throwsException(
            new MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError()
          );

        server = mockedServer({ isAuthenticated: true }, deps);
        const cookie = await authenticate(server);
        const { templateId, ...body } = command;

        // when
        const response = await request(server)
          .post(`/monthly-templates/${templateId}/monthly-outflows`)
          .send(body)
          .set("Cookie", cookie);

        // then
        expect(response.statusCode).to.be.equal(422);
        expect(response.body.success).to.be.false;
      });

      it("when label is empty", async function () {
        // given
        const command: AddMonthlyOutflowCommand = {
          templateId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
          label: "",
          amount: 10,
        };
        deps.addMonthlyOutflowUsecase.execute = sinon
          .stub()
          .withArgs(command)
          .throwsException(new MonthlyOutflowTemplateLabelCanNotBeEmptyError());

        server = mockedServer({ isAuthenticated: true }, deps);
        const cookie = await authenticate(server);
        const { templateId, ...body } = command;

        // when
        const response = await request(server)
          .post(`/monthly-templates/${templateId}/monthly-outflows`)
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
      await request(server)
        .post(
          "/monthly-templates/85467999-2751-4f04-8d96-7d7727fbff02/monthly-outflows"
        )
        .expect(401);
    });
  });
});
