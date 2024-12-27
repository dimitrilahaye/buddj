import http from "node:http";
import request from "supertest";
import sinon from "sinon";
import { afterEach, beforeEach } from "mocha";
import {
  authenticate,
  expect,
  mockedServer,
} from "../../../../integration/consumers/test-helpers.js";
import deps from "../../../../../ioc/index.js";
import DeleteExpenseCommand from "../../../../../core/commands/DeleteExpenseCommand.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";

describe("Integration | Consumers | Routes | DELETE /months/{monthId}/weekly/{weeklyId}/expenses/{expenseId}", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command: DeleteExpenseCommand = {
        monthId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
        weeklyId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
        expenseId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
      };
      const updatedMonth = Symbol("updatedMonth");
      const dto = "dto";
      const depsStub = {
        ...deps,
        monthDto: sinon.stub().withArgs(updatedMonth).returns(dto),
      };
      depsStub.deleteExpenseUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(updatedMonth);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const { monthId, weeklyId, expenseId } = command;

      // when
      const response = await request(server)
        .delete(`/months/${monthId}/weekly/${weeklyId}/expenses/${expenseId}`)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(dto);
    });

    it("should return 400 error if body was malformed", async function () {
      // given
      const command: DeleteExpenseCommand = {
        monthId: "not-an-id",
        weeklyId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
        expenseId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
      };

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId, weeklyId, expenseId } = command;

      // when
      const response = await request(server)
        .delete(`/months/${monthId}/weekly/${weeklyId}/expenses/${expenseId}`)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const command: DeleteExpenseCommand = {
        monthId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
        weeklyId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
        expenseId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
      };
      deps.deleteExpenseUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .throwsException(new MonthNotFoundError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId, weeklyId, expenseId } = command;

      // when
      const response = await request(server)
        .delete(`/months/${monthId}/weekly/${weeklyId}/expenses/${expenseId}`)
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
        .delete(
          "/months/85467999-2751-4f04-8d96-7d7727fbff02/weekly/85467999-2751-4f04-8d96-7d7727fbff02/expenses/85467999-2751-4f04-8d96-7d7727fbff02"
        )
        .expect(401);
    });
  });
});
