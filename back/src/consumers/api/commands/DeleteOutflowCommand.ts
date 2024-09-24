import DeleteOutflowCommandInterface from '../../../core/commands/DeleteOutflowCommand.js';
import Koi from "../validators/Koi.js";
import DeleteOutflowCommandError from "../errors/DeleteOutflowCommandError.js";

export default class DeleteOutflowCommand implements DeleteOutflowCommandInterface {
    monthId: string;
    outflowId: string;

    constructor(props: {
        monthId: string;
        outflowId: string;
    }) {
        this.monthId = props.monthId;
        this.outflowId = props.outflowId;
    }

    static toCommand(params: any): DeleteOutflowCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
            Koi.validate(params.outflowId).uuid();
        } catch (e: any) {
            throw new DeleteOutflowCommandError(e.message);
        }

        return new DeleteOutflowCommand({
            monthId: params.monthId,
            outflowId: params.outflowId,
        });
    }
}
