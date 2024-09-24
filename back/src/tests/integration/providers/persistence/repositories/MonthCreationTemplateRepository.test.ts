import expect, {Clock} from "../../../../test-helpers.js";
import MonthCreationTemplateRepository
    from "../../../../../providers/persistence/repositories/MonthCreationTemplateRepository.js";

describe("Integration | Providers | Persistence | Repositories | MonthCreationTemplateRepository", function () {
    const monthDate = new Date('2024-01-01');
    let clock = new Clock();

    afterEach(() => {
        clock.restore();
    });

    it("should return the right data for a new month creation", async function () {
        // given
        clock.start(monthDate);
        const repository = new MonthCreationTemplateRepository();

        // when
        const newMonth = await repository.getNewMonthTemplate();

        // then
        expect(newMonth.startingBalance).to.equal(0);
        expect(newMonth.month).to.deep.equal(monthDate);
        expect(newMonth.weeklyBudgets).to.have.length(5);
        expect(newMonth.weeklyBudgets.every((budget) => budget.initialBalance === 200)).to.be.true;
        expect(newMonth.outflows).to.have.length(25);
    });
});
