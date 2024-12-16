import { MigrationInterface, QueryRunner } from "typeorm";

export class YearlyTableAddTypeColumn1734366562522 implements MigrationInterface {
    name = 'YearlyTableAddTypeColumn1734366562522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "yearly_outflows" ADD "type" character varying NOT NULL DEFAULT 'outflow'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "yearly_outflows" DROP COLUMN "type"`);
    }

}
