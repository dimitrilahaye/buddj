import htmlFactory from "../utils/htmlFactory.js";
import Element from "./Element.js";
import Input from "./Input.js";

export default class FormFieldContainer extends Element {
    /**
     *
     * @param {FormField} formField
     */
    constructor(formField) {
        super();

        this.$element = htmlFactory(`
            <div class="field">
                <div class="control">
                    <label class="label" for="${formField.$element.id}">
                        <!-- FormField -->
                    </label>
                </div>
            </div>
        `);

        if (formField.$element.type === 'checkbox') {
            this.$element.querySelector('.control label').append(formField.$element.value);
            this.$element.querySelector('.control label').classList.add('checkbox');
            this.$element.querySelector('.control label').classList.remove('label');
        }

        this.$element.querySelector('.control label').append(formField.$element);
    }
}
