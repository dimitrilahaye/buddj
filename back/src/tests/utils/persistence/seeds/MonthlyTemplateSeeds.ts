import IdProvider from "../../../../providers/IdProvider.js";
import { MonthlyTemplateDao } from "../../../../providers/persistence/entities/MonthlyTemplate.js";
import { MonthlyOutflowTemplateDao } from "../../../../providers/persistence/entities/MonthlyOutflowTemplate.js";
import { MonthlyBudgetTemplateDao } from "../../../../providers/persistence/entities/MonthlyBudgetTemplate.js";

const idProvider = new IdProvider();

async function insertDefaultMonthlyTemplate() {
  return await MonthlyTemplateDao.save({
    id: idProvider.get(),
    name: "Template par défaut",
    isDefault: true,
  });
}

async function insertNonDefaultMonthlyTemplate() {
  return await MonthlyTemplateDao.save({
    id: idProvider.get(),
    name: "Template",
    isDefault: false,
  });
}

async function insertMonthlyOutflowTemplate(templateId: string) {
  const outflow = MonthlyOutflowTemplateDao.create({
    id: idProvider.get(),
    label: "label",
    amount: 10,
    monthlyTemplateId: templateId,
  });
  await outflow.save();

  return outflow;
}

async function insertMonthlyBudgetTemplate(templateId: string) {
  const budget = MonthlyBudgetTemplateDao.create({
    id: idProvider.get(),
    name: "label",
    initialBalance: 10,
    monthlyTemplateId: templateId,
  });
  await budget.save();

  return budget;
}

export {
  insertDefaultMonthlyTemplate,
  insertNonDefaultMonthlyTemplate,
  insertMonthlyOutflowTemplate,
  insertMonthlyBudgetTemplate,
};
