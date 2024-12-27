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
import { TransferBalanceIntoMonthCommand } from "../../../../../core/usecases/month/TransferBalanceIntoMonth.js";
import { Deps } from "../../../../../ioc/index.js";
import { TransferableAccountNotFoundError } from "../../../../../core/errors/TransferableMonthErrors.js";
import { TransferBalanceIntoMonthError } from "../../../../../core/errors/TransferBalanceIntoMonthErrors.js";

describe("Integration | Consumers | Routes | PUT /months/:monthId/transfer/from/:fromType/:fromId/to/:toType/:toId", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command: TransferBalanceIntoMonthCommand = {
        monthId: "262e7d82-89bf-4810-bdb4-6ab30bd6e28e",
        amount: 20,
        fromAccountId: "6d9cdb2c-305e-4b9f-bab5-f583d6427006",
        toWeeklyBudgetId: "4da627b9-c6f4-49bf-8ef5-76bfb2fc4efc",
      };
      const params = {
        monthId: command.monthId,
        fromType: "account",
        fromId: "6d9cdb2c-305e-4b9f-bab5-f583d6427006",
        toType: "weekly-budget",
        toId: "4da627b9-c6f4-49bf-8ef5-76bfb2fc4efc",
      };
      const body = {
        amount: 20,
      };
      const updatedMonth = Symbol("updatedMonth");
      const dto = "dto";
      const depsStub: Deps = {
        ...deps,
        monthDto: sinon.stub().withArgs(updatedMonth).returns(dto),
        transferBalanceIntoMonthDeserializer: sinon
          .stub()
          .withArgs(body, params)
          .returns(command),
      };
      depsStub.transferBalanceIntoMonthUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves(updatedMonth);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const { monthId, fromId, fromType, toId, toType } = params;

      // when
      const response = await request(server)
        .put(
          `/months/${monthId}/transfer/from/${fromType}/${fromId}/to/${toType}/${toId}`
        )
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(
        depsStub.transferBalanceIntoMonthDeserializer
      ).calledOnceWithExactly(body, params);
      expect(depsStub.monthDto).has.been.calledOnceWith(updatedMonth);
      expect(
        depsStub.transferBalanceIntoMonthUsecase.execute
      ).calledOnceWithExactly(command);

      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(dto);
    });

    it("should return 400 error if params are malformed", async function () {
      // given
      const params = {
        monthId: "not-an-id",
        fromType: "account",
        fromId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        toType: "weekly-budget",
        toId: "4da627b9-c6f4-49bf-8ef5-76bfb2fc4efc",
      };
      const body = {
        amount: 20,
      };

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId, fromId, fromType, toId, toType } = params;

      // when
      const response = await request(server)
        .put(
          `/months/${monthId}/transfer/from/${fromType}/${fromId}/to/${toType}/${toId}`
        )
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const params = {
        monthId: "262e7d82-89bf-4810-bdb4-6ab30bd6e28e",
        fromType: "account",
        fromId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        toType: "weekly-budget",
        toId: "4da627b9-c6f4-49bf-8ef5-76bfb2fc4efc",
      };
      const body = {
        amount: 20,
      };
      const updatedMonth = Symbol("updatedMonth");
      const dto = "dto";
      const depsStub: Deps = {
        ...deps,
        monthDto: sinon.stub().withArgs(updatedMonth).returns(dto),
      };
      depsStub.transferBalanceIntoMonthUsecase.execute = sinon
        .stub()
        .throwsException(new TransferableAccountNotFoundError());

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const { monthId, fromId, fromType, toId, toType } = params;

      // when
      const response = await request(server)
        .put(
          `/months/${monthId}/transfer/from/${fromType}/${fromId}/to/${toType}/${toId}`
        )
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(404);
      expect(response.body.success).to.be.false;
    });

    it("should return 422 error if a business error is encountered", async function () {
      // given
      const params = {
        monthId: "262e7d82-89bf-4810-bdb4-6ab30bd6e28e",
        fromType: "account",
        fromId: "a0c3861c-1383-4ef3-8c6b-167dcddd8f78",
        toType: "weekly-budget",
        toId: "4da627b9-c6f4-49bf-8ef5-76bfb2fc4efc",
      };
      const body = {
        amount: 20,
      };
      const updatedMonth = Symbol("updatedMonth");
      const dto = "dto";
      const depsStub: Deps = {
        ...deps,
        monthDto: sinon.stub().withArgs(updatedMonth).returns(dto),
      };
      depsStub.transferBalanceIntoMonthUsecase.execute = sinon
        .stub()
        .throwsException(new TransferBalanceIntoMonthError());

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const { monthId, fromId, fromType, toId, toType } = params;

      // when
      const response = await request(server)
        .put(
          `/months/${monthId}/transfer/from/${fromType}/${fromId}/to/${toType}/${toId}`
        )
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
      await request(server)
        .put(
          "/months/9bbd0515-68af-477e-a930-5d14b317f473/transfer/from/weekly-budget/74a5694c-d35f-4c39-b8e5-3eaeb151b885/to/account/85467999-2751-4f04-8d96-7d7727fbff02"
        )
        .expect(401);
    });
  });
});
