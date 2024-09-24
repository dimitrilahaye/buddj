import pkg from 'pg';
const { Client } = pkg;

type DbProps = {user: string, database: string, port: number, host: string, password: string};

export default function({user, database, port, host, password}: DbProps) {
    return new Client({user, database, port, host, password});
}
