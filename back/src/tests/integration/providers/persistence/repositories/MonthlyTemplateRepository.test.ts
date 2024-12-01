import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import MonthlyTemplateRepository from "../../../../../providers/persistence/repositories/MonthlyTemplateRepository.js";
import {
  insertDefaultMonthlyTemplate,
  insertNonDefaultMonthlyTemplate,
} from "../../../../utils/persistence/seeds/MonthlyTemplateSeeds.js";
import MonthlyTemplate from "../../../../../core/models/template/MonthlyTemplate.js";

describe("Integration | Providers | Persistence | Repositories | MonthlyTemplateRepository", function () {
  afterEach(async () => {
    await clearDB();
  });

  describe("#getDefault", () => {
    describe("When there are not any default template", () => {
      it("should return null", async () => {
        // given
        await insertNonDefaultMonthlyTemplate();
        const repository = new MonthlyTemplateRepository();

        // when
        const template = await repository.getDefault();

        // then
        expect(template).to.be.null;
      });
    });

    describe("When there is a default template", () => {
      it("should return it", async () => {
        // given
        await insertDefaultMonthlyTemplate();
        const repository = new MonthlyTemplateRepository();

        // when
        const template = await repository.getDefault();

        // then
        expect(template).to.be.instanceOf(MonthlyTemplate);
      });
    });

    describe("#getAll", () => {
      describe("when there is not any templates", () => {
        it("should return an empty list", async () => {
          // given
          const repository = new MonthlyTemplateRepository();

          // when
          const templates = await repository.getAll();

          // then
          expect(templates).to.have.length(0);
        });
      });

      describe("when there are templates", () => {
        it("should return them", async () => {
          // given
          await insertDefaultMonthlyTemplate();
          await insertNonDefaultMonthlyTemplate();
          const repository = new MonthlyTemplateRepository();

          // when
          const templates = await repository.getAll();

          // then
          expect(templates).to.have.length(2);
        });
      });
    });
  });
});
