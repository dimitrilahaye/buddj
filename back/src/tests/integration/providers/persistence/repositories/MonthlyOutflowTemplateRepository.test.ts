import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import MonthlyOutflowTemplateRepository from "../../../../../providers/persistence/repositories/MonthlyOutflowTemplateRepository.js";
import {
  insertDefaultMonthlyTemplate,
  insertMonthlyOutflowTemplate,
} from "../../../../utils/persistence/seeds/MonthlyTemplateSeeds.js";

describe("Integration | Providers | Persistence | Repositories | MonthlyOutflowTemplateRepository", function () {
  afterEach(async () => {
    await clearDB();
  });

  describe("#getAllByTemplateId", () => {
    describe("when there are no any outflows for the given template", () => {
      it("should return an empty list", async () => {
        // given
        const template = await insertDefaultMonthlyTemplate();
        const repository = new MonthlyOutflowTemplateRepository();

        // when
        const foundOutflows = await repository.getAllByTemplateId(template.id);

        // then
        expect(foundOutflows).to.have.length(0);
      });
    });

    describe("when there are outflows for the given template", () => {
      it("should return the right instance of the model", async () => {
        // given
        const template = await insertDefaultMonthlyTemplate();
        const outflow = await insertMonthlyOutflowTemplate(template.id);
        const repository = new MonthlyOutflowTemplateRepository();

        // when
        const [foundOutflow] = await repository.getAllByTemplateId(template.id);

        // then
        expect(foundOutflow).to.deep.equal(outflow.toDomain());
      });
    });
  });
});
