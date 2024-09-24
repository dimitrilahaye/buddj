import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCascades21715107410183 implements MigrationInterface {
    name = 'FixCascades21715107410183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_expenses" DROP CONSTRAINT "FK_91bc408e87a1f9da78ac1ba2fa0"`);
        await queryRunner.query(`ALTER TABLE "weekly_budgets" DROP CONSTRAINT "FK_2f30aaf77becd9bf32bc404773a"`);
        await queryRunner.query(`ALTER TABLE "outflows" DROP CONSTRAINT "FK_6d8aa1f979870aa91e5ef5c0b21"`);
        await queryRunner.query(`ALTER TABLE "months" DROP CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987"`);
        await queryRunner.query(`ALTER TABLE "months" ALTER COLUMN "account_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "weekly_expenses" ADD CONSTRAINT "FK_91bc408e87a1f9da78ac1ba2fa0" FOREIGN KEY ("weekly_budget_id") REFERENCES "weekly_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "weekly_budgets" ADD CONSTRAINT "FK_2f30aaf77becd9bf32bc404773a" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "outflows" ADD CONSTRAINT "FK_6d8aa1f979870aa91e5ef5c0b21" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "months" ADD CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "months" DROP CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987"`);
        await queryRunner.query(`ALTER TABLE "outflows" DROP CONSTRAINT "FK_6d8aa1f979870aa91e5ef5c0b21"`);
        await queryRunner.query(`ALTER TABLE "weekly_budgets" DROP CONSTRAINT "FK_2f30aaf77becd9bf32bc404773a"`);
        await queryRunner.query(`ALTER TABLE "weekly_expenses" DROP CONSTRAINT "FK_91bc408e87a1f9da78ac1ba2fa0"`);
        await queryRunner.query(`ALTER TABLE "months" ALTER COLUMN "account_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "months" ADD CONSTRAINT "FK_8e419b795fe20ed7b73dbf2c987" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "outflows" ADD CONSTRAINT "FK_6d8aa1f979870aa91e5ef5c0b21" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "weekly_budgets" ADD CONSTRAINT "FK_2f30aaf77becd9bf32bc404773a" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "weekly_expenses" ADD CONSTRAINT "FK_91bc408e87a1f9da78ac1ba2fa0" FOREIGN KEY ("weekly_budget_id") REFERENCES "weekly_budgets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
