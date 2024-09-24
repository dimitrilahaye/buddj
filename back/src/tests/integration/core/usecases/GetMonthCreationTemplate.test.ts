import expect from "../../../test-helpers.js";
import MonthCreationTemplateRepository
    from "../../../../providers/persistence/repositories/MonthCreationTemplateRepository.js";
import MonthCreationTemplate from "../../../../core/models/template/MonthCreationTemplate.js";
import GetMonthCreationTemplate from "../../../../core/usecases/GetMonthCreationTemplate.js";

describe("Integration | Core | Usecases | GetMonthCreationTemplate", function () {
    it("should return data for a new month creation", async function () {
        // given
        const usecase = new GetMonthCreationTemplate(new MonthCreationTemplateRepository());

        // when
        const newMonth = await usecase.execute();

        // then
        expect(newMonth).to.be.instanceof(MonthCreationTemplate);
    });
});
