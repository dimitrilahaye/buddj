import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeeklyExpenseTable1714295847736 implements MigrationInterface {
    name = 'AddWeeklyExpenseTable1714295847736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "weekly_expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "amount" numeric NOT NULL, "is_checked" boolean NOT NULL DEFAULT false, "checked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "weekly_budget_id" uuid, CONSTRAINT "PK_bdd35c8baf88e4e7b19e08495cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "weekly_expenses" ADD CONSTRAINT "FK_91bc408e87a1f9da78ac1ba2fa0" FOREIGN KEY ("weekly_budget_id") REFERENCES "weekly_budgets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_expenses" DROP CONSTRAINT "FK_91bc408e87a1f9da78ac1ba2fa0"`);
        await queryRunner.query(`DROP TABLE "weekly_expenses"`);
    }

}
