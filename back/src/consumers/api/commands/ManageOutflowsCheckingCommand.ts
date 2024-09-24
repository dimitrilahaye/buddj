import ManageOutflowsCheckingCommandInterface from '../../../core/commands/ManageOutflowsCheckingCommand.js';
import Koi from "../validators/Koi.js";
import ManageOutflowsCheckingCommandError from "../errors/ManageOutflowsCheckingCommandError.js";

export default class ManageOutflowsCheckingCommand implements ManageOutflowsCheckingCommandInterface {
    monthId: string;
    currentBalance: number;
    outflows: { id: string; isChecked: boolean; }[];

    constructor(props: {
        monthId: string;
        currentBalance: number;
        outflows: { id: string; isChecked: boolean; }[];
    }) {
        this.monthId = props.monthId;
        this.currentBalance = props.currentBalance;
        this.outflows = props.outflows;
    }

    static toCommand(params: any, body: any): ManageOutflowsCheckingCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
            Koi.validate(body.currentBalance).number();
            Koi.validate(body.outflows).array();
            body.outflows.forEach((outflow: { id: string; isChecked: boolean; }) => {
                Koi.validate(outflow.id).uuid();
                Koi.validate(outflow.isChecked).boolean();
            });
        } catch (e: any) {
            throw new ManageOutflowsCheckingCommandError(e.message);
        }

        return new ManageOutflowsCheckingCommand({
            monthId: params.monthId,
            currentBalance: body.currentBalance,
            outflows: body.outflows,
        });
    }
}
