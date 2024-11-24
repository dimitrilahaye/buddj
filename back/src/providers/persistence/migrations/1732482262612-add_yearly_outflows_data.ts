import { MigrationInterface, QueryRunner } from "typeorm";
import IdProvider from "../../IdProvider.js";

export class AddYearlyOutflowsData1732482262612 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const promises: Promise<any>[] = [];
    const idProvider = new IdProvider();
    const outflows = JSON.parse(process.env.YEARLY) as {
      label: string;
      amount: number;
      month: number;
    }[];

    for (const outflow of outflows) {
      promises.push(
        queryRunner.query(`
            INSERT INTO yearly_outflows (id, label, amount, month)
            VALUES (
                '${idProvider.get()}',
                '${outflow.label}',
                ${outflow.amount},
                ${outflow.month}
            )
        `)
      );
    }
    await Promise.all(promises);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE FROM yearly_outflows");
  }
}
