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
import { ProjectNotFoundError } from "../../../../core/errors/ProjectErrors.js";

describe("Integration | Consumers | Routes | PATCH /projects/:projectId/re-apply", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const { params } = getValidRequest();

      const result = Symbol("result");
      const dto = "dto";
      const depsStub: Deps = {
        ...deps,
        projectDto: sinon.stub().withArgs(result).returns(dto),
      };
      depsStub.reApplyProjectUsecase.execute = sinon.stub().resolves(result);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/projects/${params.projectId}/re-apply`)
        .set("Cookie", cookie);

      // then
      expect(depsStub.projectDto).has.been.calledOnceWith(result);
      expect(
        depsStub.reApplyProjectUsecase.execute as SinonStub
      ).to.have.been.calledOnceWithExactly({
        id: params.projectId,
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
        .patch(`/projects/not-an-id/re-apply`)
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
      const { params } = getValidRequest();

      const depsStub: Deps = {
        ...deps,
      };
      depsStub.reApplyProjectUsecase.execute = sinon
        .stub()
        .throwsException(new ProjectNotFoundError());

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(`/projects/${params.projectId}/re-apply`)
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
        .patch(`/projects/5636cbfd-ca5a-4b8b-89a2-08dbdb416efd/re-apply`)
        .expect(401);
    });
  });
});

function getValidRequest() {
  return {
    params: {
      projectId: "5636cbfd-ca5a-4b8b-89a2-08dbdb416efd",
    },
  };
}
