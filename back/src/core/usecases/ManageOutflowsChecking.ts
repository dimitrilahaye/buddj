import MonthRepository from "../ports/repositories/MonthRepository.js";
import {MonthNotFoundError} from "../errors/MonthErrors.js";
import ManageOutflowsCheckingCommand from "../commands/ManageOutflowsCheckingCommand.js";

export default class ManageOutflowsChecking {
    constructor(
        public monthRepository: MonthRepository,
    ) {
    }

    async execute(command: ManageOutflowsCheckingCommand) {
        const month = await this.monthRepository.getById(command.monthId);

        if (month === null) {
            throw new MonthNotFoundError();
        }

        month.updateAccountCurrentBalance(command.currentBalance);


        command.outflows.forEach((outflow) => {
            if (outflow.isChecked) {
                month.checkOutflow(outflow.id);
            }
            if (!outflow.isChecked) {
                month.uncheckOutflow(outflow.id);
            }
        });

        await this.monthRepository.updateAccountCurrentBalance(month);

        await this.monthRepository.manageOutflowsChecking(command.outflows);

        return month;
    }
}
