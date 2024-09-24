import AccountOutflowFactory from "../factories/AccountOutflowFactory.js";
import MonthRepository from "../ports/repositories/MonthRepository.js";
import AddOutflowCommand from "../commands/AddOutflowCommand.js";
import {MonthNotFoundError} from "../errors/MonthErrors.js";

export default class AddOutflow {
    constructor(
        public readonly accountOutflowFactory: AccountOutflowFactory,
        public readonly monthRepository: MonthRepository,
    ) {
    }

    async execute(command: AddOutflowCommand) {
        const outflow = this.accountOutflowFactory.create({label: command.label, amount: command.amount});
        const month = await this.monthRepository.getById(command.monthId);

        if (month === null) {
            throw new MonthNotFoundError();
        }

        month.addOutflow(outflow);

        await this.monthRepository.addOutflow(month, outflow);

        return month;
    }
}
