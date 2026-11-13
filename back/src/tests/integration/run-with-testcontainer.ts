/**
 * Lance une commande de test contre un Postgres éphémère (Testcontainers).
 *
 * Usage : tsx src/tests/integration/run-with-testcontainer.ts <commande> [args...]
 *
 * 1. démarre un conteneur Postgres ;
 * 2. expose ses coordonnées via DB_*_TEST (prioritaires sur le .env, dotenv n'écrase pas) ;
 * 3. joue les migrations (db:prepare:test), puis la commande ;
 * 4. arrête le conteneur et propage le code de sortie.
 */
import { spawnSync } from "node:child_process";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: run-with-testcontainer.ts <command> [args...]");
  process.exit(1);
}

const container = await new PostgreSqlContainer("postgres:17-alpine")
  .withDatabase("cb-api-test")
  .withUsername("test")
  .withPassword("test")
  .start();

const env = {
  ...process.env,
  NODE_ENV: "test",
  DB_URL_TEST: container.getHost(),
  DB_PORT_TEST: String(container.getPort()),
  DB_USER_TEST: container.getUsername(),
  DB_PASSWORD_TEST: container.getPassword(),
  DB_NAME_TEST: container.getDatabase(),
};

function run(cmd: string, cmdArgs: string[]): number {
  const result = spawnSync(cmd, cmdArgs, { stdio: "inherit", env });
  if (result.error) {
    console.error(result.error);
    return 1;
  }
  return result.status ?? 1;
}

let exitCode = 1;
try {
  exitCode = run("npm", ["run", "db:prepare:test"]);
  if (exitCode === 0) {
    exitCode = run("npx", [command, ...args]);
  }
} finally {
  await container.stop();
}

process.exit(exitCode);
