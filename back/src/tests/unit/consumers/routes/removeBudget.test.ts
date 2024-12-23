import http from "node:http";
import request from "supertest";
import sinon, { SinonStub } from "sinon";
import { afterEach, beforeEach } from "mocha";
import {
  authenticate,
  expect,
  mockedServer,
} from "../../../integration/consumers/test-helpers.js";
import * as deps from "../../../../ioc.js";
import { RemoveBudgetCommand } from "../../../../core/usecases/RemoveBudget.js";
import { MonthNotFoundError } from "../../../../core/errors/MonthErrors.js";
import { Deps } from "../../../../ioc.js";
import { AccountBudgetCanNotBeRemovedError } from "../../../../core/errors/WeeklyBudgetErrors.js";

describe("Integration | Consumers | Routes | DELETE /months/{monthId}/budgets/{budgetId}", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command: RemoveBudgetCommand = {
        monthId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        budgetId: "0cf17604-be48-40d4-89e4-aab9f090cf08",
      };
      const updatedMonth = Symbol("updatedMonth");
      const dto = "dto";
      const depsStub: Deps = {
        ...deps,
        monthDto: sinon.stub().withArgs(updatedMonth).returns(dto),
      };
      depsStub.removeBudgetUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(updatedMonth);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const { monthId, budgetId } = command;

      // when
      const response = await request(server)
        .delete(`/months/${monthId}/budgets/${budgetId}`)
        .set("Cookie", cookie);

      // then
      expect(depsStub.monthDto).has.been.calledOnceWith(updatedMonth);
      expect(
        (depsStub.removeBudgetUsecase.execute as SinonStub).args
      ).to.deep.equal([[command]]);
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(dto);
    });

    it("should return 400 error if body was malformed", async function () {
      // given
      const command: RemoveBudgetCommand = {
        monthId: "not-an-id",
        budgetId: "0cf17604-be48-40d4-89e4-aab9f090cf08",
      };

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId, budgetId } = command;

      // when
      const response = await request(server)
        .delete(`/months/${monthId}/budgets/${budgetId}`)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const command: RemoveBudgetCommand = {
        monthId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        budgetId: "0cf17604-be48-40d4-89e4-aab9f090cf08",
      };
      deps.removeBudgetUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .throwsException(new MonthNotFoundError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId, budgetId } = command;

      // when
      const response = await request(server)
        .delete(`/months/${monthId}/budgets/${budgetId}`)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(404);
      expect(response.body.success).to.be.false;
    });

    it("should return 422 error if budget can not been removed", async function () {
      // given
      const command: RemoveBudgetCommand = {
        monthId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        budgetId: "0cf17604-be48-40d4-89e4-aab9f090cf08",
      };
      deps.removeBudgetUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .throwsException(new AccountBudgetCanNotBeRemovedError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId, budgetId } = command;

      // when
      const response = await request(server)
        .delete(`/months/${monthId}/budgets/${budgetId}`)
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
      await request(server)
        .delete(
          "/months/85467999-2751-4f04-8d96-7d7727fbff02/budgets/0cf17604-be48-40d4-89e4-aab9f090cf08"
        )
        .expect(401);
    });
  });
});
