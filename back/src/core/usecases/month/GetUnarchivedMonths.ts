import MonthRepository from "../../ports/repositories/MonthRepository.js";

export default class GetUnarchivedMonths {
  constructor(public monthRepository: MonthRepository) {}

  async execute() {
    return await this.monthRepository.findAllUnarchived();
  }
}
