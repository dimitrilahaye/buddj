import {DataSource, DataSourceOptions} from "typeorm";
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import env from '../../env-vars.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionOptions: DataSourceOptions = {
    type: "postgres" as "postgres",
    host: env.dbUrl,
    port: env.dbPort,
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    synchronize: false,
    logging: true,
    entities: [__dirname + "/entities/*{.ts,.js}"],
    migrations: [__dirname + "/migrations/*{.ts,.js}"],
};

export default new DataSource({
    ...connectionOptions,
});
