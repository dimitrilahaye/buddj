import { describePatchRoute } from "../patch-route-contract.js";

const TEMPLATE_ID = "85467999-2751-4f04-8d96-7d7727fbff02";
const LINE_ID = "2e270898-f374-43be-a29a-479eebe7cb35";

describePatchRoute({
  title: "PATCH /monthly-templates/:templateId/monthly-outflows/:outflowId",
  url: `/monthly-templates/${TEMPLATE_ID}/monthly-outflows/${LINE_ID}`,
  params: { templateId: TEMPLATE_ID, outflowId: LINE_ID },
  body: { label: "Engie", amount: 90 },
  deserializerKey: "updateMonthlyOutflowDeserializer",
  usecaseKey: "updateMonthlyOutflowUsecase",
});
describePatchRoute({
  title: "PATCH /monthly-templates/:templateId/monthly-budgets/:budgetId",
  url: `/monthly-templates/${TEMPLATE_ID}/monthly-budgets/${LINE_ID}`,
  params: { templateId: TEMPLATE_ID, budgetId: LINE_ID },
  body: { name: "Courses", initialBalance: 250 },
  deserializerKey: "updateMonthlyBudgetDeserializer",
  usecaseKey: "updateMonthlyBudgetUsecase",
});
