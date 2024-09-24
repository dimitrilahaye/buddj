import { MigrationInterface, QueryRunner } from "typeorm";

export class FixWeeklyExpenseTable1714297378151 implements MigrationInterface {
    name = 'FixWeeklyExpenseTable1714297378151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_expenses" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "weekly_expenses" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_expenses" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "weekly_expenses" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
