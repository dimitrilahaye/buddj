import IdProvider from "../../../../providers/IdProvider.js";
import { MonthlyTemplateDao } from "../../../../providers/persistence/entities/MonthlyTemplate.js";

const idProvider = new IdProvider();

async function insertDefaultMonthlyTemplate() {
  await MonthlyTemplateDao.insert({
    id: idProvider.get(),
    name: "Template par défaut",
    isDefault: true,
  });
}

async function insertNonDefaultMonthlyTemplate() {
  await MonthlyTemplateDao.insert({
    id: idProvider.get(),
    name: "Template",
    isDefault: false,
  });
}

export { insertDefaultMonthlyTemplate, insertNonDefaultMonthlyTemplate };
