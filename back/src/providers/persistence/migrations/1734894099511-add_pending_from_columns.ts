import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPendingFromColumns1734894099511 implements MigrationInterface {
    name = 'AddPendingFromColumns1734894099511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_budgets" ADD "pending_from" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "outflows" ADD "pending_from" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outflows" DROP COLUMN "pending_from"`);
        await queryRunner.query(`ALTER TABLE "weekly_budgets" DROP COLUMN "pending_from"`);
    }

}
