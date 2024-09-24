import { MigrationInterface, QueryRunner } from "typeorm";

export class FixOutflowsTable1713981407482 implements MigrationInterface {
    name = 'FixOutflowsTable1713981407482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outflows" DROP COLUMN "start_at"`);
        await queryRunner.query(`ALTER TABLE "outflows" DROP COLUMN "end_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outflows" ADD "end_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "outflows" ADD "start_at" TIMESTAMP WITH TIME ZONE`);
    }

}
