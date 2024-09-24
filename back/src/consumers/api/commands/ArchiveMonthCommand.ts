import ArchiveMonthCommandInterface from '../../../core/commands/ArchiveMonthCommand.js';
import Koi from "../validators/Koi.js";
import ArchiveMonthCommandError from "../errors/ArchiveMonthCommandError.js";

export default class ArchiveMonthCommand implements ArchiveMonthCommandInterface {
    monthId: string;

    constructor(props: {
        monthId: string;
    }) {
        this.monthId = props.monthId;
    }

    static toCommand(params: any): ArchiveMonthCommandInterface {
        try {
            Koi.validate(params.monthId).uuid();
        } catch (e: any) {
            throw new ArchiveMonthCommandError(e.message);
        }

        return new ArchiveMonthCommand({
            monthId: params.monthId,
        });
    }
}
