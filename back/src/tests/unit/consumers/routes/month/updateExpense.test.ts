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
import UpdateExpenseCommand from "../../../../../core/commands/UpdateExpenseCommand.js";
import { MonthNotFoundError } from "../../../../../core/errors/MonthErrors.js";
import { WeeklyExpenseAmountError } from "../../../../../core/errors/WeeklyExpenseErrors.js";

describe("Integration | Consumers | Routes | PUT /months/{monthId}/weekly/{weeklyId}/expenses/{expenseId}", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command: UpdateExpenseCommand = {
        monthId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        originalWeeklyId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        newWeeklyId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        expenseId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        label: "JOW",
        amount: 10,
      };
      const updatedMonth = Symbol("updatedMonth");
      const dto = "dto";
      const depsStub = {
        ...deps,
        monthDto: sinon.stub().withArgs(updatedMonth).returns(dto),
      };
      depsStub.updateExpenseUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(updatedMonth);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const {
        monthId,
        originalWeeklyId: weeklyId,
        expenseId,
        ...body
      } = command;

      // when
      const response = await request(server)
        .put(`/months/${monthId}/weekly/${weeklyId}/expenses/${expenseId}`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(dto);
    });

    it("should return 400 error if body was malformed", async function () {
      // given
      const command: UpdateExpenseCommand = {
        monthId: "not-an-id",
        originalWeeklyId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        newWeeklyId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        expenseId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        label: "JOW",
        amount: 10,
      };

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const {
        monthId,
        originalWeeklyId: weeklyId,
        expenseId,
        ...body
      } = command;

      // when
      const response = await request(server)
        .put(`/months/${monthId}/weekly/${weeklyId}/expenses/${expenseId}`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 422 error if a core error is thrown", async function () {
      // given
      const command: UpdateExpenseCommand = {
        monthId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        originalWeeklyId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        newWeeklyId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        expenseId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        label: "JOW",
        amount: 10,
      };
      deps.updateExpenseUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .rejects(new WeeklyExpenseAmountError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const {
        monthId,
        originalWeeklyId: weeklyId,
        expenseId,
        ...body
      } = command;

      // when
      const response = await request(server)
        .put(`/months/${monthId}/weekly/${weeklyId}/expenses/${expenseId}`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(422);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const command: UpdateExpenseCommand = {
        monthId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        originalWeeklyId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        newWeeklyId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        expenseId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        label: "JOW",
        amount: 10,
      };
      deps.updateExpenseUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .throwsException(new MonthNotFoundError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const {
        monthId,
        originalWeeklyId: weeklyId,
        expenseId,
        ...body
      } = command;

      // when
      const response = await request(server)
        .put(`/months/${monthId}/weekly/${weeklyId}/expenses/${expenseId}`)
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
        .put(
          "/months/85467999-2751-4f04-8d96-7d7727fbff02/weekly/85467999-2751-4f04-8d96-7d7727fbff02/expenses/85467999-2751-4f04-8d96-7d7727fbff02"
        )
        .expect(401);
    });
  });
});
