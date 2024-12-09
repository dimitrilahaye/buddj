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
import UnarchiveMonthCommand from "../../../../core/commands/UnarchiveMonthCommand.js";
import { MonthNotFoundError } from "../../../../core/errors/MonthErrors.js";

describe("Integration | Consumers | Routes | PUT /months/{monthId}/unarchive", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command: UnarchiveMonthCommand = {
        monthId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
      };
      const unarchivedMonth = Symbol("unarchivedMonth");
      const dto = "dto";
      const depsStub = {
        ...deps,
        monthDto: sinon.stub().withArgs(unarchivedMonth).returns(dto),
      };
      depsStub.unarchiveMonthUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .resolves([unarchivedMonth]);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);
      const { monthId } = command;

      // when
      const response = await request(server)
        .put(`/months/${monthId}/unarchive`)
        .set("Cookie", cookie);

      // then
      expect(depsStub.unarchiveMonthUsecase.execute as SinonStub).to.have.been
        .calledOnce;
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.deep.equal([dto]);
    });

    it("should return 400 error if body was malformed", async function () {
      // given
      const command: UnarchiveMonthCommand = {
        monthId: "not-an-id",
      };

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId } = command;

      // when
      const response = await request(server)
        .put(`/months/${monthId}/unarchive`)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const command: UnarchiveMonthCommand = {
        monthId: "60164d6e-3c17-43ed-bf3e-24e44e68d857",
      };
      deps.unarchiveMonthUsecase.execute = sinon
        .stub()
        .withArgs(command)
        .throwsException(new MonthNotFoundError());

      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);
      const { monthId } = command;

      // when
      const response = await request(server)
        .put(`/months/${monthId}/unarchive`)
        .set("Cookie", cookie);

      // then
      expect(deps.unarchiveMonthUsecase.execute as SinonStub).to.have.been
        .calledOnce;
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
        .put("/months/85467999-2751-4f04-8d96-7d7727fbff02/unarchive")
        .expect(401);
    });
  });
});
