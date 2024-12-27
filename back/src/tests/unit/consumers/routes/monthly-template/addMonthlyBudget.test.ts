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
import { AddMonthlyBudgetCommand } from "../../../../../core/usecases/monthly-template/AddMonthlyBudget.js";
import { Deps } from "../../../../../ioc/index.js";
import {
  MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError,
  MonthlyBudgetTemplateNameCanNotBeEmptyError,
  MonthlyTemplateDoesNotExistError,
} from "../../../../../core/errors/MonthlyTemplateErrors.js";

describe("Integration | Consumers | Routes | POST /monthly-templates/:templateId/monthly-budgets", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command: AddMonthlyBudgetCommand = {
        templateId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        name: "JOW",
        initialBalance: 10,
      };
      const updatedTemplate = "updatedTemplate";
      const depsStub: Deps = {
        ...deps,
        addMonthlyBudgetDeserializer: sinon
          .stub()
          .withArgs(
            { templateId: command.templateId },
            { name: command.name, initialBalance: command.initialBalance }
          )
          .returns(command),
      };
      depsStub.addMonthlyBudgetUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(updatedTemplate);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const { templateId, ...body } = command;

      // when
      const response = await request(server)
        .post(`/monthly-templates/${templateId}/monthly-budgets`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(
        (depsStub.addMonthlyBudgetDeserializer as SinonStub).args
      ).to.deep.equal([
        [
          { templateId: command.templateId },
          { name: command.name, initialBalance: command.initialBalance },
        ],
      ]);
      expect(
        (depsStub.addMonthlyBudgetUsecase.execute as SinonStub).args
      ).to.deep.equal([[command]]);
      expect(response.statusCode).to.be.equal(201);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(updatedTemplate);
    });

    it("should return 400 error if body was malformed", async function () {
      // given
      const command: AddMonthlyBudgetCommand = {
        templateId: "not-an-id",
        name: "JOW",
        initialBalance: 10,
      };

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { templateId, ...body } = command;

      // when
      const response = await request(server)
        .post(`/monthly-templates/${templateId}/monthly-budgets`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const command: AddMonthlyBudgetCommand = {
        templateId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        name: "JOW",
        initialBalance: 10,
      };
      deps.addMonthlyBudgetUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .throwsException(new MonthlyTemplateDoesNotExistError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { templateId, ...body } = command;

      // when
      const response = await request(server)
        .post(`/monthly-templates/${templateId}/monthly-budgets`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(404);
      expect(response.body.success).to.be.false;
    });

    describe("it should return 422 error", () => {
      it("when initial balance is 0 or less", async function () {
        // given
        const command: AddMonthlyBudgetCommand = {
          templateId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
          name: "JOW",
          initialBalance: 0,
        };
        deps.addMonthlyBudgetUsecase.execute = sinon
          .stub()
          .withArgs(command)
          .throwsException(
            new MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError()
          );

        server = mockedServer({ isAuthenticated: true }, deps);
        const cookie = await authenticate(server);
        const { templateId, ...body } = command;

        // when
        const response = await request(server)
          .post(`/monthly-templates/${templateId}/monthly-budgets`)
          .send(body)
          .set("Cookie", cookie);

        // then
        expect(response.statusCode).to.be.equal(422);
        expect(response.body.success).to.be.false;
      });

      it("when name is empty", async function () {
        // given
        const command: AddMonthlyBudgetCommand = {
          templateId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
          name: "",
          initialBalance: 10,
        };
        deps.addMonthlyBudgetUsecase.execute = sinon
          .stub()
          .withArgs(command)
          .throwsException(new MonthlyBudgetTemplateNameCanNotBeEmptyError());

        server = mockedServer({ isAuthenticated: true }, deps);
        const cookie = await authenticate(server);
        const { templateId, ...body } = command;

        // when
        const response = await request(server)
          .post(`/monthly-templates/${templateId}/monthly-budgets`)
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
          "/monthly-templates/85467999-2751-4f04-8d96-7d7727fbff02/monthly-budgets"
        )
        .expect(401);
    });
  });
});
