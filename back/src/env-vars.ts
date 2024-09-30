// dotenv said "dotenv provides its own type definitions, so you don't need @types/dotenv installed!" but warning is still there...
// @ts-ignore
import { configDotenv } from "dotenv";
import "reflect-metadata";

configDotenv();

export type DbConfig = {
  dbUrl: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
};

let dbConfig = {};

if (process.env.NODE_ENV === "test") {
  dbConfig = {
    dbUrl: process.env.DB_URL_TEST as string,
    dbPort: Number(process.env.DB_PORT_TEST),
    dbUser: process.env.DB_USER_TEST as string,
    dbPassword: process.env.DB_PASSWORD_TEST as string,
    dbName: process.env.DB_NAME_TEST as string,
  };
} else {
  dbConfig = {
    dbUrl: process.env.DB_URL as string,
    dbPort: Number(process.env.DB_PORT),
    dbUser: process.env.DB_USER as string,
    dbPassword: process.env.DB_PASSWORD as string,
    dbName: process.env.DB_NAME as string,
  };
}

export default {
  nodeEnv: process.env.NODE_ENV as string,
  port: process.env.NODE_ENV === "test" ? 8082 : Number(process.env.PORT),
  clientId: process.env.CLIENT_ID as string,
  clientSecret: process.env.CLIENT_SECRET as string,
  redirectUri: process.env.REDIRECT_URI as string,
  scopes: process.env.SCOPES as string,
  scriptId: process.env.SCRIPT_ID as string,
  sessionSecret: process.env.SESSION_SECRET as string,
  frontUrl: process.env.FRONT_URL as string,
  frontRedirectUrl: process.env.FRONT_REDIRECT_URL as string,
  template: JSON.parse(process.env.TEMPLATE as string) as any,
  ...(dbConfig as DbConfig),
};
