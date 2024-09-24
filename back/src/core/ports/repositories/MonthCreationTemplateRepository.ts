import MonthCreationTemplate from "../../../core/models/template/MonthCreationTemplate.js";

export default interface MonthCreationTemplateRepository {
    getNewMonthTemplate(): Promise<MonthCreationTemplate>;
}
