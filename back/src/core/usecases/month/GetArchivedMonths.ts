import MonthRepository from "../../ports/repositories/MonthRepository.js";

export default class GetArchivedMonths {
  constructor(public monthRepository: MonthRepository) {}

  async execute() {
    return await this.monthRepository.findAllArchived();
  }
}
