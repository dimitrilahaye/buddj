import { configDotenv } from "dotenv";

configDotenv();

// La BDD (conteneur éphémère + migrations) est préparée par run-with-testcontainer.ts
process.env.NODE_ENV = "test";
