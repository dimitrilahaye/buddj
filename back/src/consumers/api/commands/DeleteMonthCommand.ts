import DeleteMonthCommandInterface from '../../../core/commands/DeleteMonthCommand.js';
import Koi from "../validators/Koi.js";
import DeleteMonthCommandError from "../errors/DeleteMonthCommandError.js";

export default class DeleteMonthCommand implements DeleteMonthCommandInterface {
    monthId: string;

    constructor(props: {
        monthId: string;
    }) {
        this.monthId = props.monthId;
    }

    static toCommand(params: any): DeleteMonthCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
        } catch (e: any) {
            throw new DeleteMonthCommandError(e.message);
        }

        return new DeleteMonthCommand({
            monthId: params.monthId,
        });
    }
}
