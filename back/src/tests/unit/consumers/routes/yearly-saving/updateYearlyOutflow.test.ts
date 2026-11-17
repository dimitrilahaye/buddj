import { describePatchRoute } from "../patch-route-contract.js";

const LINE_ID = "2e270898-f374-43be-a29a-479eebe7cb35";

describePatchRoute({
  title: "PATCH /yearly-outflows/:id",
  url: `/yearly-outflows/${LINE_ID}`,
  params: { id: LINE_ID },
  body: { label: "Assurance", amount: 600 },
  deserializerKey: "updateYearlyOutflowDeserializer",
  usecaseKey: "updateYearlyOutflowUsecase",
  dtoKey: "yearlyOutflowsDto",
});
