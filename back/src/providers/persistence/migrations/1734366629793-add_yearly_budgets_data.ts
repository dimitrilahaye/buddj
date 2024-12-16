import { MigrationInterface, QueryRunner } from "typeorm";

export class AddYearlyBudgetsData1734366629793 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const selectPromises: Promise<any>[] = [];
    const updatePromises: Promise<any>[] = [];
    const budgets = JSON.parse(process.env.YEARLY_BUDGETS) as {
      label: string;
      amount: number;
      month: number;
    }[];

    for (const budget of budgets) {
      selectPromises.push(
        queryRunner.query(`
            SELECT id, month, label, amount FROM yearly_outflows
            WHERE month = ${budget.month}
            AND label = '${budget.label}'
            AND amount = ${budget.amount}
        `)
      );
    }
    const budgetsToUpdate = (await Promise.all(selectPromises)).filter(
      (r) => r.length > 0
    );

    console.info(JSON.stringify(budgetsToUpdate, null, 2));

    for (const budgetToUpdate of budgetsToUpdate) {
      updatePromises.push(
        queryRunner.query(`
                UPDATE yearly_outflows
                SET type = 'budget'
                WHERE month = ${budgetToUpdate[0].month}
                AND label = '${budgetToUpdate[0].label}'
                AND amount = ${budgetToUpdate[0].amount}
            `)
      );
    }
    await Promise.all(updatePromises);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const selectPromises: Promise<any>[] = [];
    const updatePromises: Promise<any>[] = [];
    const budgets = JSON.parse(process.env.YEARLY_BUDGETS) as {
      label: string;
      amount: number;
      month: number;
    }[];

    for (const budget of budgets) {
      selectPromises.push(
        queryRunner.query(`
            SELECT id, month, label, amount FROM yearly_outflows
            WHERE month = ${budget.month}
            AND label = '${budget.label}'
            AND amount = ${budget.amount}
        `)
      );
    }
    const budgetsToUpdate = (await Promise.all(selectPromises)).filter(
      (r) => r.length > 0
    );

    for (const budgetToUpdate of budgetsToUpdate) {
      updatePromises.push(
        queryRunner.query(`
                UPDATE yearly_outflows
                SET type = 'outflow'
                WHERE month = ${budgetToUpdate[0].month}
                AND label = '${budgetToUpdate[0].label}'
                AND amount = ${budgetToUpdate[0].amount}
            `)
      );
    }
    await Promise.all(updatePromises);
  }
}
