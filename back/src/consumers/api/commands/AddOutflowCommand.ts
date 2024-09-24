import AddOutflowCommandInterface from '../../../core/commands/AddOutflowCommand.js';
import Koi from "../validators/Koi.js";
import AddOutflowCommandError from "../errors/AddOutflowCommandError.js";

export default class AddOutflowCommand implements AddOutflowCommandInterface {
    monthId: string;
    label: string;
    amount: number;

    constructor(props: {
        monthId: string;
        label: string;
        amount: number;
    }) {
        this.monthId = props.monthId;
        this.label = props.label;
        this.amount = props.amount;
    }

    static toCommand(params: any, body: any): AddOutflowCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
            Koi.validate(body.label).string();
            Koi.validate(body.amount).number();
        } catch (e: any) {
            throw new AddOutflowCommandError(e.message);
        }

        return new AddOutflowCommand({
            monthId: params.monthId,
            label: body.label,
            amount: body.amount,
        });
    }
}
