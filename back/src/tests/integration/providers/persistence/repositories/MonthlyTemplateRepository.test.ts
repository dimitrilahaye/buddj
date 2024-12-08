import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import MonthlyTemplateRepository from "../../../../../providers/persistence/repositories/MonthlyTemplateRepository.js";
import {
  insertDefaultMonthlyTemplate,
  insertNonDefaultMonthlyTemplate,
} from "../../../../utils/persistence/seeds/MonthlyTemplateSeeds.js";
import MonthlyTemplate from "../../../../../core/models/monthly-template/MonthlyTemplate.js";

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

    describe("#getById", () => {
      describe("when template does not exist", () => {
        it("should return null", async () => {
          // given
          const repository = new MonthlyTemplateRepository();

          // when
          const template = await repository.getById(
            "6186fae7-8e54-4de2-bb68-17b7042bd813"
          );

          // then
          expect(template).to.be.null;
        });
      });

      describe("when template exists", () => {
        it("should return it", async () => {
          // given
          const template = await insertDefaultMonthlyTemplate();
          const repository = new MonthlyTemplateRepository();

          // when
          const foundTemplate = await repository.getById(template.id);

          // then
          if (foundTemplate === null) {
            expect.fail("foundTemplate should not be null");
            return;
          }
          expect(template.id).to.be.equal(foundTemplate.id);
        });
      });
    });

    describe("#save", () => {
      it("should udpate the template", async () => {
        // given
        const dao = await insertDefaultMonthlyTemplate();
        const repository = new MonthlyTemplateRepository();

        const template = dao.toDomain();
        template.updateName("new name");
        template.updateIsDefault(false);

        // when
        const updatedTemplate = await repository.save(template);

        // then
        expect(updatedTemplate.name).to.equal(template.name);
        expect(updatedTemplate.isDefault).to.equal(template.isDefault);
      });
    });
  });
});
