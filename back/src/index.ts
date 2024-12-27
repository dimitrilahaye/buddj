import env from "./env-vars.js";
import deps from "./ioc/index.js";
import buildApi from "./consumers/api/server.js";
import { Express } from "express";
import passport from "passport";
import passportConfig from "./providers/auth/passport-provider.js";

try {
  await deps.dbClient.connect();
  console.log("DB connected.");
} catch (e: any) {
  throw new Error("DB Connection error: " + e.message);
}

const setupPassport = (api: Express) => {
  api.use(passport.initialize());
  api.use(passport.session());

  passportConfig(
    passport,
    {
      clientID: env.clientId,
      clientSecret: env.clientSecret,
      callbackURL: env.redirectUri,
      scope: env.scopes,
    },
    { userRepository: deps.userRepository }
  );
};

const server = buildApi(env, setupPassport, deps);

async function terminate(error?: Error) {
  await deps.dbClient.end();
  console.log("DB connection closed.");
  server.close();
  console.log("Server closed.");
  process.exit(error ? 1 : 0);
}

process.on("uncaughtException", async (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  await terminate(err);
});

process.on("unhandledRejection", async (reason: any, promise) => {
  console.log("Unhandled rejection at ", promise, `reason: ${reason.message}`);
  await terminate(reason);
});

process.on("SIGTERM", async (signal) => {
  console.log(`Process ${process.pid} received a SIGTERM signal`);
  if (signal) {
    console.log(`Received signal ${signal}`);
  }
  await terminate();
});

process.on("SIGINT", async (signal) => {
  console.log(`Process ${process.pid} has been interrupted`);
  if (signal) {
    console.log(`Received signal ${signal}`);
  }
  await terminate();
});
