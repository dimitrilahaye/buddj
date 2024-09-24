import MonthCreationTemplateRepository from "../ports/repositories/MonthCreationTemplateRepository.js";

export default class GetMonthCreationTemplate {
    constructor(public monthCreationTemplateRepository: MonthCreationTemplateRepository) {}

    async execute() {
        return this.monthCreationTemplateRepository.getNewMonthTemplate();
    }
}
