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
import { UpdateBudgetCommand } from "../../../../../core/usecases/month/UpdateBudget.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { Deps } from "../../../../../ioc.js";

describe("Integration | Consumers | Routes | PATCH /months/:monthId/budgets/:budget", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command: UpdateBudgetCommand = {
        monthId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        name: "JOW",
        budgetId: "2e270898-f374-43be-a29a-479eebe7cb35",
      };
      const updatedMonth = Symbol("updatedMonth");
      const dto = "dto";
      const depsStub: Deps = {
        ...deps,
        monthDto: sinon.stub().withArgs(updatedMonth).returns(dto),
        updateBudgetDeserializer: sinon
          .stub()
          .withArgs(
            { monthId: command.monthId, budgetId: command.budgetId },
            { name: command.name }
          )
          .returns(command),
      };
      depsStub.updateBudgetUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(updatedMonth);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const { monthId, budgetId, ...body } = command;

      // when
      const response = await request(server)
        .patch(`/months/${monthId}/budgets/${budgetId}`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(
        (depsStub.updateBudgetDeserializer as SinonStub).args
      ).to.deep.equal([
        [
          { monthId: command.monthId, budgetId: command.budgetId },
          { name: command.name },
        ],
      ]);
      expect(depsStub.monthDto).has.been.calledOnceWith(updatedMonth);
      expect(
        (depsStub.updateBudgetUsecase.execute as SinonStub).args
      ).to.deep.equal([[command]]);
      expect(response.statusCode).to.be.equal(201);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(dto);
    });

    it("should return 400 error if body was malformed", async function () {
      // given
      const command: UpdateBudgetCommand = {
        monthId: "not-an-id",
        name: "JOW",
        budgetId: "2e270898-f374-43be-a29a-479eebe7cb35",
      };

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId, budgetId, ...body } = command;

      // when
      const response = await request(server)
        .patch(`/months/${monthId}/budgets/${budgetId}`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const command: UpdateBudgetCommand = {
        monthId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        name: "JOW",
        budgetId: "2e270898-f374-43be-a29a-479eebe7cb35",
      };
      deps.updateBudgetUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .throwsException(new MonthNotFoundError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId, budgetId, ...body } = command;

      // when
      const response = await request(server)
        .patch(`/months/${monthId}/budgets/${budgetId}`)
        .send(body)
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
      await request(server)
        .patch(
          "/months/85467999-2751-4f04-8d96-7d7727fbff02/budgets/2e270898-f374-43be-a29a-479eebe7cb35"
        )
        .expect(401);
    });
  });
});
