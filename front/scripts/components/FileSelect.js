import Select from "../elements/Select.js";

export default class FileSelect extends Select {
    /**
     *
     * @param {{
     *     id?: string,
     * }} props
     * @param {Month[]} months
     */
    constructor(months, props = {id: 'file-select'}) {
        /**
         *
         * @param {Month[]} months
         * @return {{label: *, value: *, selected: boolean}[]}
         */
        function buildOptions(months) {
            const now = new Date();
            const nowName = getFileValue(now);

            return months.map((month) => ({
                value: month.id,
                label: month.name,
                selected: month.name === nowName,
            }));
        }

        function getFileValue(date) {
            const month = date.getMonth();
            const m = month >= 10 ? month + 1 : '0' + (month + 1);
            const year = date.getFullYear();
            return `${year}-${m}`;
        }

        months.sort((a, b) => Number(a.name.split('-')[1]) - Number(b.name.split('-')[1]));
        const options = buildOptions(months);

        super({
            id: props.id,
            name: 'file',
            options,
        });
        this.$element.classList.add('file-select');
    }
}
