// import MonthRepository from "../ports/repositories/MonthRepository.js";
// import { MonthNotFoundError } from "../errors/MonthErrors.js";

// export interface UpdateBudgetCommand {
//   monthId: string;
//   budgetId: string;
//   name: string;
// }

// export default class UpdateBudget {
//   constructor(
//     public readonly monthRepository: MonthRepository
//   ) {}

//   async execute(command: UpdateBudgetCommand) {
//     const month = await this.monthRepository.getById(command.monthId);

//     if (month === null) {
//       throw new MonthNotFoundError();
//     }

//     month.addBudget(budget);

//     await this.monthRepository.addBudget(month, budget);

//     return month;
//   }
// }
