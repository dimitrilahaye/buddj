import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMonthTables1713980153962 implements MigrationInterface {
    name = 'CreateMonthTables1713980153962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "weekly_budgets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "current_balance" numeric NOT NULL, "start_at" TIMESTAMP WITH TIME ZONE, "end_at" TIMESTAMP WITH TIME ZONE, "account_id" uuid, CONSTRAINT "PK_26205960143e3c58abcad8988ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "outflows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "amount" numeric NOT NULL, "is_checked" boolean NOT NULL DEFAULT false, "checked_at" TIMESTAMP WITH TIME ZONE, "start_at" TIMESTAMP WITH TIME ZONE, "end_at" TIMESTAMP WITH TIME ZONE, "account_id" uuid, CONSTRAINT "PK_2728ac9db86d7c731e2246f3020" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "current_balance" numeric NOT NULL, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "months" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "start_at" TIMESTAMP WITH TIME ZONE, "end_at" TIMESTAMP WITH TIME ZONE, "is_archived" boolean NOT NULL DEFAULT false, "account_id" uuid, CONSTRAINT "REL_8e419b795fe20ed7b73dbf2c98" UNIQUE ("account_id"), CONSTRAINT "PK_6d28d9fc3fd263f08f01fc8f044" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "weekly_budgets" ADD CONSTRAINT "FK_2f30aaf77becd9bf32bc404773a" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "outflows" ADD CONSTRAINT "FK_6d8aa1f979870aa91e5ef5c0b21" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "months" ADD CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "months" DROP CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987"`);
        await queryRunner.query(`ALTER TABLE "outflows" DROP CONSTRAINT "FK_6d8aa1f979870aa91e5ef5c0b21"`);
        await queryRunner.query(`ALTER TABLE "weekly_budgets" DROP CONSTRAINT "FK_2f30aaf77becd9bf32bc404773a"`);
        await queryRunner.query(`DROP TABLE "months"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TABLE "outflows"`);
        await queryRunner.query(`DROP TABLE "weekly_budgets"`);
    }

}
