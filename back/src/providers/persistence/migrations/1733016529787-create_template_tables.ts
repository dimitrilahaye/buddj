import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTemplateTables1733016529787 implements MigrationInterface {
  name = "CreateTemplateTables1733016529787";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "monthly_budget_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "initial_balance" numeric NOT NULL, "monthly_template_id" uuid NOT NULL, CONSTRAINT "PK_ef37811f001adbd7cff73ec248a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "monthly_outflow_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "amount" numeric NOT NULL, "monthly_template_id" uuid NOT NULL, CONSTRAINT "PK_7d7c180591036365786f5319d03" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "monthly_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "is_default" boolean NOT NULL, CONSTRAINT "PK_9d814cdccf374b60481c14ec6c7" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "monthly_templates"`);
    await queryRunner.query(`DROP TABLE "monthly_outflow_templates"`);
    await queryRunner.query(`DROP TABLE "monthly_budget_templates"`);
  }
}
