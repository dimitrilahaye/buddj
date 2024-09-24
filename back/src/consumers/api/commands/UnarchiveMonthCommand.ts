import UnarchiveMonthCommandInterface from '../../../core/commands/UnarchiveMonthCommand.js';
import Koi from "../validators/Koi.js";
import UnarchiveMonthCommandError from "../errors/UnarchiveMonthCommandError.js";

export default class UnarchiveMonthCommand implements UnarchiveMonthCommandInterface {
    monthId: string;

    constructor(props: {
        monthId: string;
    }) {
        this.monthId = props.monthId;
    }

    static toCommand(params: any): UnarchiveMonthCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
        } catch (e: any) {
            throw new UnarchiveMonthCommandError(e.message);
        }

        return new UnarchiveMonthCommand({
            monthId: params.monthId,
        });
    }
}
