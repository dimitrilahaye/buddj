import http from "node:http";
import request from "supertest";
import sinon, { SinonStub } from "sinon";
import { afterEach, beforeEach } from "mocha";
import {
  authenticate,
  expect,
  mockedServer,
} from "../../../../integration/consumers/test-helpers.js";
import * as deps from "../../../../../ioc.js";
import { Deps } from "../../../../../ioc.js";
import {
  ProjectTargetMustBePositiveError,
  UnknownCategoryError,
} from "../../../../../core/errors/ProjectErrors.js";

describe("Integration | Consumers | Routes | POST /projects", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 201 on happy path", async function () {
      // given
      const { body } = getValidRequest();

      const result = Symbol("result");
      const dto = "dto";
      const depsStub: Deps = {
        ...deps,
        projectDto: sinon.stub().withArgs(result).returns(dto),
      };
      depsStub.createProjectUsecase.execute = sinon.stub().resolves(result);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .post(`/projects`)
        .send(body)
        .set("Cookie", cookie);

      // then
      expect(depsStub.projectDto).has.been.calledOnceWith(result);
      expect(
        depsStub.createProjectUsecase.execute as SinonStub
      ).to.have.been.calledOnceWithExactly({
        category: body.category,
        name: body.name,
        target: body.target,
      });
      expect(response.statusCode).to.be.equal(201);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.equal(dto);
    });

    it("should return 400 error if request was malformed", async function () {
      // given
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .post(`/projects`)
        .send({
          category: "refund",
          name: "iPhone",
          target: "not-a-number",
        })
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return a 422 when target is not valid", async function () {
      // given
      const depsStub: Deps = {
        ...deps,
      };
      depsStub.createProjectUsecase.execute = sinon
        .stub()
        .throwsException(new ProjectTargetMustBePositiveError());

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .post(`/projects`)
        .send({
          category: "refund",
          name: "iPhone",
          target: 0,
        })
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(422);
      expect(response.body.success).to.be.false;
    });

    it("should return a 422 when category is not valid", async function () {
      // given
      const depsStub: Deps = {
        ...deps,
      };
      depsStub.createProjectUsecase.execute = sinon
        .stub()
        .throwsException(new UnknownCategoryError("invald-category"));

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .post(`/projects`)
        .send({
          category: "invaldcategory",
          name: "iPhone",
          target: 100,
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
      await request(server).post(`/projects`).expect(401);
    });
  });
});

function getValidRequest() {
  return {
    body: {
      category: "refund",
      name: "iPhone",
      target: 200,
    },
  };
}
