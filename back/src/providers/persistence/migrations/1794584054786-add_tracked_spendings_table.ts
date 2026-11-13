import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrackedSpendingsTable1794584054786 implements MigrationInterface {
    name = 'AddTrackedSpendingsTable1794584054786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tracked_spendings" ("id" uuid NOT NULL, "kind" character varying NOT NULL, "source_id" uuid NOT NULL, "label" character varying NOT NULL, "amount" numeric NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_tracked_spendings_kind_source_id" UNIQUE ("kind", "source_id"), CONSTRAINT "CHK_tracked_spendings_kind" CHECK ("kind" IN ('expense', 'outflow')), CONSTRAINT "PK_tracked_spendings_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_tracked_spendings_occurred_at" ON "tracked_spendings" ("occurred_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_tracked_spendings_occurred_at"`);
        await queryRunner.query(`DROP TABLE "tracked_spendings"`);
    }

}
