import { describePatchRoute } from "../patch-route-contract.js";

const MONTH_ID = "a0c3861c-1383-4ef3-8c6b-167dcddd8f78";
const LINE_ID = "2e270898-f374-43be-a29a-479eebe7cb35";

describePatchRoute({
  title: "PATCH /months/:monthId/outflows/:outflowId",
  url: `/months/${MONTH_ID}/outflows/${LINE_ID}`,
  params: { monthId: MONTH_ID, outflowId: LINE_ID },
  body: { label: "Engie", amount: 90 },
  deserializerKey: "updateOutflowDeserializer",
  usecaseKey: "updateOutflowUsecase",
  dtoKey: "monthDto",
});
