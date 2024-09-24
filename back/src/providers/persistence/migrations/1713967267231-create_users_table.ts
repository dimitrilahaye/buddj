import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1713967267231 implements MigrationInterface {
    name = 'CreateUsersTable1713967267231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "google_id" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "tokens" jsonb NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
