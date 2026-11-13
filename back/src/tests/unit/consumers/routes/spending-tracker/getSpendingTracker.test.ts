import http from "node:http";
import request from "supertest";
import sinon from "sinon";
import { afterEach, beforeEach } from "mocha";
import {
  authenticate,
  expect,
  mockedServer,
} from "../../../../integration/consumers/test-helpers.js";
import deps, { Deps } from "../../../../../ioc/index.js";
import GetSpendingTrackerCommand from "../../../../../core/commands/GetSpendingTrackerCommand.js";
import { SpendingTrackerRangeError } from "../../../../../core/errors/SpendingTrackerErrors.js";

describe("Integration | Consumers | Routes | GET /spending-tracker", function () {
  let server: http.Server;

  function depsWith(execute: sinon.SinonStub, dto = sinon.stub()): Deps {
    return {
      ...deps,
      getSpendingTrackerUsecase: { execute } as any,
      spendingTrackerDto: dto,
    };
  }

  describe("When user is authenticated", function () {
    afterEach(function () {
      server.close();
    });

    it("should return a 200 with the dto of the use-case result", async function () {
      // given
      const command: GetSpendingTrackerCommand = {
        granularity: "week",
        from: "2026-08-01",
        to: "2026-11-13",
      };
      const tracker = Symbol("tracker");
      const execute = sinon.stub().withArgs(command).resolves(tracker);
      const dto = sinon.stub().withArgs(tracker).returns("dto");
      server = mockedServer({ isAuthenticated: true }, depsWith(execute, dto));
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get("/spending-tracker")
        .query(command)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.deep.equal({ success: true, data: "dto" });
    });

    it("should return a 422 when the use-case rejects the range", async function () {
      // given
      const execute = sinon.stub().rejects(new SpendingTrackerRangeError());
      server = mockedServer({ isAuthenticated: true }, depsWith(execute));
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get("/spending-tracker")
        .query({ granularity: "day", from: "2026-11-01", to: "2026-11-02" })
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.body.success).to.be.false;
    });

    it("should return a 500 when the use-case fails unexpectedly", async function () {
      // given
      const execute = sinon.stub().rejects(new Error("db down"));
      server = mockedServer({ isAuthenticated: true }, depsWith(execute));
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get("/spending-tracker")
        .query({ granularity: "day", from: "2026-11-01", to: "2026-11-02" })
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.equal(500);
      expect(response.body.success).to.be.false;
    });
  });

  describe("When user is not authenticated", function () {
    beforeEach(function () {
      server = mockedServer(
        { isAuthenticated: false },
        depsWith(sinon.stub().resolves())
      );
    });

    afterEach(function () {
      server.close();
    });

    it("should return a 401 error", async function () {
      await request(server)
        .get("/spending-tracker")
        .query({ granularity: "day", from: "2026-11-01", to: "2026-11-02" })
        .expect(401);
    });
  });
});
