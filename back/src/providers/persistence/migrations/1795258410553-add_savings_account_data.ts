import { MigrationInterface, QueryRunner } from "typeorm";
import IdProvider from "../../IdProvider.js";

const SAVINGS_ACCOUNT_NAME = "Livret A Crédit Agricole";

/** Seul moyen de créer un compte épargne pour l'instant. */
export class AddSavingsAccountData1795258410553 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "savings_accounts" ("id", "name", "amount") VALUES ($1, $2, 0)`,
      [new IdProvider().get(), SAVINGS_ACCOUNT_NAME]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "savings_accounts" WHERE "name" = $1`, [
      SAVINGS_ACCOUNT_NAME,
    ]);
  }
}
