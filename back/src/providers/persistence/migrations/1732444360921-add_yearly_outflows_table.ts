import { MigrationInterface, QueryRunner } from "typeorm";

export class AddYearlyOutflowsTable1732444360921 implements MigrationInterface {
    name = 'AddYearlyOutflowsTable1732444360921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "yearly_outflows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "amount" numeric NOT NULL, "month" integer NOT NULL, CONSTRAINT "PK_ec4feb7d32cf0922081a594f836" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "yearly_outflows"`);
    }

}
