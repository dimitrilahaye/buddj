import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProjectsTable1735255915724 implements MigrationInterface {
    name = 'AddProjectsTable1735255915724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "category" character varying NOT NULL, "target" numeric NOT NULL, "logs" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "projects"`);
    }

}
