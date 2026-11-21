import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSavingsAccountsTables1795258410552 implements MigrationInterface {
    name = 'AddSavingsAccountsTables1795258410552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "savings_accounts" ("id" uuid NOT NULL, "name" character varying NOT NULL, "amount" numeric NOT NULL DEFAULT '0', CONSTRAINT "PK_75c3ac9a54f19179f999beb9cc7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "savings_account_operations" ("id" uuid NOT NULL, "savings_account_id" uuid NOT NULL, "type" character varying NOT NULL, "amount" numeric NOT NULL, "label" character varying, "date" date NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_savings_account_operations_amount" CHECK ("amount" > 0), CONSTRAINT "CHK_savings_account_operations_type" CHECK ("type" IN ('deposit', 'withdrawal')), CONSTRAINT "PK_9c4d99e7cd5c64fca5f6a07c3b3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_savings_account_operations_account_date" ON "savings_account_operations"  ("savings_account_id", "date") `);
        await queryRunner.query(`ALTER TABLE "savings_account_operations" ADD CONSTRAINT "FK_savings_account_operations_savings_account_id" FOREIGN KEY ("savings_account_id") REFERENCES "savings_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "savings_account_operations" DROP CONSTRAINT "FK_savings_account_operations_savings_account_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_savings_account_operations_account_date"`);
        await queryRunner.query(`DROP TABLE "savings_account_operations"`);
        await queryRunner.query(`DROP TABLE "savings_accounts"`);
    }

}
