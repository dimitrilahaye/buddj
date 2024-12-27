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

describe("Integration | Consumers | Routes | GET /projects/category/:category", function () {
  let server: http.Server;

  describe("When user is authenticated", function () {
    afterEach(async function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const { params } = getValidRequest();

      const result = ["result"];
      const dto = "dto";
      const depsStub: Deps = {
        ...deps,
        projectDto: sinon.stub().withArgs(result[0]).returns(dto),
      };
      depsStub.getAllProjectsByCategoryUsecase.execute = sinon
        .stub()
        .resolves(result);

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get(`/projects/category/${params.category}`)
        .set("Cookie", cookie);

      // then
      expect(depsStub.projectDto).has.been.calledOnceWith(result[0]);
      expect(
        depsStub.getAllProjectsByCategoryUsecase.execute as SinonStub
      ).to.have.been.calledOnceWithExactly({
        category: params.category,
      });
      expect(response.statusCode).to.be.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.deep.equal([dto]);
    });

    it("should return 400 error if request was malformed", async function () {
      // given
      server = mockedServer({ isAuthenticated: true }, deps);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .get(`/projects/category/123`)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.be.equal(400);
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
      await request(server).get(`/projects/category/refund`).expect(401);
    });
  });
});

function getValidRequest() {
  return {
    params: {
      category: "refund",
    },
  };
}
