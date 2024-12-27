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
import { Deps } from "../../../../ioc.js";
import {
  ProjectAmountMustBePositiveError,
  ProjectNotFoundError,
} from "../../../../core/errors/ProjectErrors.js";

describe("Integration | Consumers | Routes | PATCH /projects/:projectId/add", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const { params, body } = getValidRequest();

      const result = Symbol("result");
      const dto = "dto";
      const depsStub: Deps = {
        ...deps,
        projectDto: sinon.stub().withArgs(result).returns(dto),
      };
      depsStub.addAmountProjectUsecase.execute = sinon.stub().resolves(result);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/projects/${params.projectId}/add`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(depsStub.projectDto).has.been.calledOnceWith(result);
      expect(
        depsStub.addAmountProjectUsecase.execute as SinonStub
      ).to.have.been.calledOnceWithExactly({
        id: params.projectId,
        amount: body.amount,
      });
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(dto);
    });

    it("should return 400 error if request was malformed", async function () {
      // given
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/projects/not-an-id/add`)
        .send({
          amount: 10,
        })
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return 404 error if a model is not found", async function () {
      // given
      const { params, body } = getValidRequest();

      const depsStub: Deps = {
        ...deps,
      };
      depsStub.addAmountProjectUsecase.execute = sinon
        .stub()
        .throwsException(new ProjectNotFoundError());

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/projects/${params.projectId}/add`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(404);
      expect(response.body.success).to.be.false;
    });

    it("should return a 422 when amount is not valid", async function () {
      // given
      const depsStub: Deps = {
        ...deps,
      };
      depsStub.addAmountProjectUsecase.execute = sinon
        .stub()
        .throwsException(new ProjectAmountMustBePositiveError());

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/projects/5636cbfd-ca5a-4b8b-89a2-08dbdb416efd/add`)
        .send({
          amount: 0,
        })
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
        .patch(`/projects/5636cbfd-ca5a-4b8b-89a2-08dbdb416efd/add`)
        .expect(401);
    });
  });
});

function getValidRequest() {
  return {
    params: {
      projectId: "5636cbfd-ca5a-4b8b-89a2-08dbdb416efd",
    },
    body: {
      amount: 10,
    },
  };
}
