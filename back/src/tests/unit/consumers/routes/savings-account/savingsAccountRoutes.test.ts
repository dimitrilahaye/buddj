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
import { SavingsAccountOperationNotFoundError } from "../../../../../core/errors/SavingsAccountErrors.js";

const ACCOUNT_ID = "7a5b8c62-4b7e-4c0e-9c3e-1f2d3e4f5a6b";
const OPERATION_ID = "1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b";

describe("Integration | Consumers | Routes | /savings-accounts", function () {
  let server: http.Server;

  afterEach(function () {
    server?.close();
  });

  async function serverWith(overrides: Partial<Deps>) {
    server = mockedServer({ isAuthenticated: true }, { ...deps, ...overrides });
    return authenticate(server);
  }

  it("GET should return the dto of every account", async function () {
    // given
    const cookie = await serverWith({
      getSavingsAccountsUsecase: {
        execute: sinon.stub().resolves(["a", "b"]),
      } as any,
      savingsAccountDto: ((account: string) => `dto-${account}`) as any,
    });

    // when
    const response = await request(server)
      .get("/savings-accounts")
      .set("Cookie", cookie);

    // then
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.deep.equal({
      success: true,
      data: ["dto-a", "dto-b"],
    });
  });

  it("POST should add an operation and return 201", async function () {
    // given
    const execute = sinon.stub().resolves("account");
    const cookie = await serverWith({
      addSavingsAccountOperationUsecase: { execute } as any,
      savingsAccountDto: (() => "dto") as any,
    });

    // when
    const response = await request(server)
      .post(`/savings-accounts/${ACCOUNT_ID}/operations`)
      .send({ type: "withdrawal", amount: 120, date: "2026-11-20" })
      .set("Cookie", cookie);

    // then
    expect(response.statusCode).to.equal(201);
    expect(execute).to.have.been.calledOnceWith({
      savingsAccountId: ACCOUNT_ID,
      type: "withdrawal",
      amount: 120,
      date: "2026-11-20",
      label: null,
    });
  });

  it("POST should return 400 on an invalid body", async function () {
    // given
    const cookie = await serverWith({});

    // when
    const response = await request(server)
      .post(`/savings-accounts/${ACCOUNT_ID}/operations`)
      .send({ type: "gift", amount: -1, date: "20/11/2026" })
      .set("Cookie", cookie);

    // then
    expect(response.statusCode).to.equal(400);
  });

  it("PATCH should return 404 when the operation does not exist", async function () {
    // given
    const cookie = await serverWith({
      updateSavingsAccountOperationUsecase: {
        execute: sinon.stub().rejects(new SavingsAccountOperationNotFoundError()),
      } as any,
    });

    // when
    const response = await request(server)
      .patch(`/savings-accounts/${ACCOUNT_ID}/operations/${OPERATION_ID}`)
      .send({ type: "deposit", amount: 10, date: "2026-11-20", label: "x" })
      .set("Cookie", cookie);

    // then
    expect(response.statusCode).to.equal(404);
  });

  it("DELETE should delete an operation", async function () {
    // given
    const execute = sinon.stub().resolves("account");
    const cookie = await serverWith({
      deleteSavingsAccountOperationUsecase: { execute } as any,
      savingsAccountDto: (() => "dto") as any,
    });

    // when
    const response = await request(server)
      .delete(`/savings-accounts/${ACCOUNT_ID}/operations/${OPERATION_ID}`)
      .set("Cookie", cookie);

    // then
    expect(response.statusCode).to.equal(200);
    expect(execute).to.have.been.calledOnceWith({
      savingsAccountId: ACCOUNT_ID,
      operationId: OPERATION_ID,
    });
  });

  it("GET tracker should return the tracker dto", async function () {
    // given
    const execute = sinon.stub().resolves("tracker");
    const cookie = await serverWith({
      getSavingsAccountTrackerUsecase: { execute } as any,
      savingsAccountTrackerDto: (() => "dto") as any,
    });

    // when
    const response = await request(server)
      .get(`/savings-accounts/${ACCOUNT_ID}/tracker`)
      .query({ granularity: "day", from: "2026-11-01", to: "2026-11-30" })
      .set("Cookie", cookie);

    // then
    expect(response.statusCode).to.equal(200);
    expect(response.body.data).to.equal("dto");
    expect(execute).to.have.been.calledOnceWith({
      savingsAccountId: ACCOUNT_ID,
      granularity: "day",
      from: "2026-11-01",
      to: "2026-11-30",
    });
  });

  it("should return 401 when not authenticated", async function () {
    server = mockedServer({ isAuthenticated: false }, deps);
    await request(server).get("/savings-accounts").expect(401);
  });
});
