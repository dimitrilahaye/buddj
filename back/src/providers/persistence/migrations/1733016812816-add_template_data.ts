import { MigrationInterface, QueryRunner } from "typeorm";
import IdProvider from "../../IdProvider.js";
import MonthlyTemplate from "../../../core/models/template/MonthlyTemplate.js";
import MonthlyBudgetTemplate from "../../../core/models/template/MonthlyBudgetTemplate.js";
import MonthlyOutflowTemplate from "../../../core/models/template/MonthlyOutflowTemplate.js";

export class AddTemplateData1733016812816 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const idProvider = new IdProvider();

    const template = new MonthlyTemplate({
      id: idProvider.get(),
      isDefault: true,
      name: "Template par défaut",
    });

    const budgets = (
      JSON.parse(process.env.TEMPLATE).budgets as {
        name: string;
        initialBalance: number;
      }[]
    ).map(
      (budget) =>
        new MonthlyBudgetTemplate({
          ...budget,
          id: idProvider.get(),
        })
    );

    const outflows = (
      JSON.parse(process.env.TEMPLATE).outflows as {
        label: string;
        amount: number;
      }[]
    ).map(
      (outflow) =>
        new MonthlyOutflowTemplate({
          ...outflow,
          id: idProvider.get(),
        })
    );

    await queryRunner.query(`
        INSERT INTO monthly_templates
        (
            id,
            name,
            is_default
        ) VALUES
        (
            '${template.id}',
            '${template.name}',
            ${template.isDefault}
        )
    `);

    const promises: Promise<any>[] = [];
    outflows.forEach((o) => {
      promises.push(
        queryRunner.query(`
            INSERT INTO monthly_outflow_templates
            (
                id,
                amount,
                label,
                monthly_template_id
            ) VALUES
            (
                '${o.id}',
                ${o.amount},
                '${o.label}',
                '${template.id}'
            )
        `)
      );
    });
    budgets.forEach((b) => {
      promises.push(
        queryRunner.query(`
            INSERT INTO monthly_budget_templates
            (
                id,
                initial_balance,
                name,
                monthly_template_id
            ) VALUES
            (
                '${b.id}',
                ${b.initialBalance},
                '${b.name}',
                '${template.id}'
            )
        `)
      );
    });

    await Promise.all(promises);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE FROM monthly_budget_templates");
    await queryRunner.query("DELETE FROM monthly_outflow_templates");
    await queryRunner.query("DELETE FROM monthly_templates");
  }
}
