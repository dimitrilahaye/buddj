import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInitialBalanceToWeeklyBudget1714388282767 implements MigrationInterface {
    name = 'AddInitialBalanceToWeeklyBudget1714388282767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_budgets" ADD "initial_balance" numeric NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_budgets" DROP COLUMN "initial_balance"`);
    }

}
