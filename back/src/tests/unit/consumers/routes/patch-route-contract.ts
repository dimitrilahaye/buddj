import http from "node:http";
import request from "supertest";
import sinon, { SinonStub } from "sinon";
import { afterEach } from "mocha";
import {
  authenticate,
  expect,
  mockedServer,
} from "../../../integration/consumers/test-helpers.js";
import deps from "../../../../ioc/index.js";
import DeserializationError from "../../../../consumers/api/errors/DeserializationError.js";

export type PatchRouteCase = {
  title: string;
  url: string;
  params: Record<string, string>;
  body: Record<string, unknown>;
  deserializerKey: string;
  usecaseKey: string;
  dtoKey?: string;
};

/** Contrat commun des routes PATCH de modification d’une ligne : 200, 400, 401. */
export function describePatchRoute(c: PatchRouteCase): void {
  describe(`Integration | Consumers | Routes | ${c.title}`, function () {
    let server: http.Server;

    afterEach(function () {
      server.close();
    });

    it("should return a 200 on happy path", async function () {
      // given
      const command = Symbol("command");
      const result = Symbol("result");
      const depsStub: any = {
        ...deps,
        [c.deserializerKey]: sinon.stub().returns(command),
      };
      if (c.dtoKey) {
        depsStub[c.dtoKey] = sinon.stub().withArgs(result).returns("dto");
      }
      depsStub[c.usecaseKey] = {
        execute: sinon.stub().withArgs(command).resolves(result),
      };

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(c.url)
        .send(c.body)
        .set("Cookie", cookie);

      // then
      expect((depsStub[c.deserializerKey] as SinonStub).args).to.deep.equal([
        [c.params, c.body],
      ]);
      expect(depsStub[c.usecaseKey].execute).to.have.been.calledOnceWith(
        command
      );
      expect(response.statusCode).to.equal(200);
      expect(response.body.success).to.be.true;
      if (c.dtoKey) {
        expect(response.body.data).to.equal("dto");
      }
    });

    it("should return a 400 if the request is malformed", async function () {
      // given
      const depsStub: any = {
        ...deps,
        [c.deserializerKey]: sinon
          .stub()
          .throwsException(new DeserializationError("", "")),
      };

      server = mockedServer({ isAuthenticated: true }, depsStub);
      const cookie = await authenticate(server);

      // when
      const response = await request(server)
        .patch(c.url)
        .send(c.body)
        .set("Cookie", cookie);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.body.success).to.be.false;
    });

    it("should return a 401 if the user is not authenticated", async function () {
      server = mockedServer({ isAuthenticated: false }, deps);

      await request(server).patch(c.url).send(c.body).expect(401);
    });
  });
}
