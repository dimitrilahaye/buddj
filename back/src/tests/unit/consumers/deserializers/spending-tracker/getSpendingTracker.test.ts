import http from "node:http";
import request from "supertest";
import sinon from "sinon";
import { afterEach } from "mocha";
import {
  authenticate,
  expect,
  mockedServer,
} from "../../../../integration/consumers/test-helpers.js";
import deps, { Deps } from "../../../../../ioc/index.js";

describe("Unit | Consumers | Deserializers | getSpendingTracker (via GET /spending-tracker)", function () {
  let server: http.Server;
  let execute: sinon.SinonStub;

  async function get(query: Record<string, string>) {
    execute = sinon.stub().resolves(Symbol("tracker"));
    const depsStub: Deps = {
      ...deps,
      getSpendingTrackerUsecase: { execute } as any,
      spendingTrackerDto: sinon.stub().returns("dto"),
    };
    server = mockedServer({ isAuthenticated: true }, depsStub);
    const cookie = await authenticate(server);
    return request(server)
      .get("/spending-tracker")
      .query(query)
      .set("Cookie", cookie);
  }

  afterEach(function () {
    server.close();
  });

  it("should pass a valid query to the use-case as a command", async function () {
    // when
    const response = await get({
      granularity: "month",
      from: "2026-01-01",
      to: "2026-11-13",
      ignored: "value",
    });

    // then
    expect(response.statusCode).to.equal(200);
    expect(execute).to.have.been.calledOnceWithExactly({
      granularity: "month",
      from: "2026-01-01",
      to: "2026-11-13",
    });
  });

  it("should accept a single-day range", async function () {
    const response = await get({
      granularity: "day",
      from: "2026-11-13",
      to: "2026-11-13",
    });

    expect(response.statusCode).to.equal(200);
  });

  const invalidQueries: Array<[string, Record<string, string>]> = [
    ["an unknown granularity", { granularity: "year", from: "2026-11-01", to: "2026-11-13" }],
    ["a missing granularity", { from: "2026-11-01", to: "2026-11-13" }],
    ["a missing from", { granularity: "day", to: "2026-11-13" }],
    ["a missing to", { granularity: "day", from: "2026-11-01" }],
    ["a malformed from", { granularity: "day", from: "01/11/2026", to: "2026-11-13" }],
    ["a datetime instead of a day", { granularity: "day", from: "2026-11-01T00:00:00Z", to: "2026-11-13" }],
    ["an impossible date", { granularity: "day", from: "2026-02-30", to: "2026-11-13" }],
    ["from after to", { granularity: "day", from: "2026-11-13", to: "2026-11-01" }],
  ];

  invalidQueries.forEach(([description, query]) => {
    it(`should return a 400 for ${description}`, async function () {
      // when
      const response = await get(query);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.body.success).to.be.false;
      expect(execute).not.to.have.been.called;
    });
  });
});
