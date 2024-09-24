import {Client, QueryConfigValues} from "pg";

export type User = {
    id?: number;
    googleId: string;
    name: string;
    email: string;
}

export type Tokens = {
    scope: string,
    token_type: string,
    expiry_date: number,
    access_token: string,
    refresh_token: string,
}

type UserProps = {
    user: User;
    token: Tokens;
}

type UserModel = {
    tokens: Tokens
} & User;

export default class UserRepository {
    dbClient: Client;

    constructor(dbClient: Client) {
        this.dbClient = dbClient;
    }

    async save(data: UserProps) {
        const {user, token} = data;

        await this.dbClient.query(`
            INSERT INTO users(google_id, name, email, tokens)
            SELECT $1, $2, $3, $4
            WHERE
            NOT EXISTS (
                SELECT google_id FROM users WHERE google_id = $5
            );
        `, [user.googleId, user.name, user.email, token, user.googleId] as QueryConfigValues<User>);
    }

    async get(googleId: string): Promise<UserModel|null> {
        const {rows} = await this.dbClient.query('SELECT * FROM users WHERE google_id = $1', [googleId])
        const userDao = rows[0];
        if (!userDao) {
            return null;
        }
        return {
            ...userDao,
            googleId: userDao["google_id"],
        }
    }

    async updateAccessToken(googleId: string, accessToken: string) {
        const {rows} = await this.dbClient.query('SELECT * FROM users WHERE google_id = $1', [googleId])
        const user = rows[0];
        user.tokens.access_token = accessToken;

        await this.dbClient.query(`
            UPDATE users
            SET tokens = $1
            WHERE google_id = $2
        `, [user.tokens, googleId]);
    }
}
