import htmlFactory from "../utils/htmlFactory.js";
import FormField from "./FormField.js";

export default class Select extends FormField {
    /**
     *
     * @param {string} id
     * @param {string} name
     * @param {Option[]} options
     */
    constructor({id, name, options}) {
        super(id);

        this.$element = htmlFactory(`
            <div class="select">
                <select id="${this.id}" name="${name}"></select>
            </div>
        `);
        options.forEach(({label, selected, value}) => {
            const $option = htmlFactory(`<option value="${value}" ${selected ? 'selected="selected"' : ''}>${label}</option>`)
            this.$element.querySelector('select').append($option);
        });
    }

    get value() {
        return this.$element.querySelector('select').value;
    }
}
