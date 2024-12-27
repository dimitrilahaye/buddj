import YearlyOutflowRepository from "../../ports/repositories/YearlyOutflowRepository.js";

export default class GetYearlyOutflows {
  constructor(public yearlyOutflowRepository: YearlyOutflowRepository) {}

  async execute() {
    return this.yearlyOutflowRepository.getAll();
  }
}
