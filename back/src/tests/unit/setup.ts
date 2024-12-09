import { configDotenv } from "dotenv";

configDotenv();

process.env.NODE_ENV = "test";
process.env.MOCHA_TEST = "unit";
