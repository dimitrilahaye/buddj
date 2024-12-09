import * as http from "node:http";
import sinon from "sinon";
import { Express, Request } from "express";
import passport from "passport";
import { VerifyCallback } from "passport-google-oauth20";

import buildApi from "../../../consumers/api/server.js";
import { Deps } from "../../../ioc.js";
import env from "../../../env-vars.js";
import request from "supertest";
import expect from "../../test-helpers.js";

const mockedUser = { googleId: "googleId", name: "name", email: "email" };

class StrategyMock extends passport.Strategy {
  name = "mock";
  private options: MockedServerOptions;

  constructor(options: MockedServerOptions) {
    super();
    this.options = options;
  }

  verify(done: VerifyCallback) {
    done(null, mockedUser);
  }

  authenticate(req: Request, options?: any): any {
    if (this.options.isAuthenticated === true) {
      this.verify((err, user) => {
        this.success(mockedUser);
      });
    }
    if (this.options.isAuthenticated === false) {
      this.fail("Unauthorized");
    }
  }
}

type MockedServerOptions = {
  isAuthenticated: boolean;
};

const mockedServer = (options: MockedServerOptions, dependencies: Deps) => {
  const setupPassport = (api: Express) => {
    api.use(passport.initialize());
    api.use(passport.session());

    passport.serializeUser(function (user, done) {
      done(null, user.googleId);
    });

    passport.deserializeUser(async function (userId: string, done) {
      return done(null, mockedUser);
    });

    passport.use(new StrategyMock(options));

    api.get(
      "/auth/google",
      passport.authenticate("mock", {
        successRedirect: "/",
        failureRedirect: "/login",
      })
    );
  };

  dependencies.userRepository.get = sinon.stub().resolves(mockedUser);
  dependencies.userRepository.save = sinon.stub().resolves();
  return buildApi(env, setupPassport, dependencies);
};

const authenticate = async (server: http.Server) => {
  const loginResponse = await request(server)
    .get("/auth/google")
    .withCredentials();

  return loginResponse.headers["set-cookie"];
};

export { mockedServer, authenticate, expect };
