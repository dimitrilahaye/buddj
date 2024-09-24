import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCascades1715107129685 implements MigrationInterface {
    name = 'FixCascades1715107129685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "months" DROP CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987"`);
        await queryRunner.query(`ALTER TABLE "months" ALTER COLUMN "account_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "months" ADD CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "months" DROP CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987"`);
        await queryRunner.query(`ALTER TABLE "months" ALTER COLUMN "account_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "months" ADD CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
