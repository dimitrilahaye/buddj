import { configDotenv } from "dotenv";
import { execSync } from "node:child_process";

configDotenv();

process.env.NODE_ENV = "test";

execSync("npm run db:prepare:test", {
  stdio: "inherit",
});
