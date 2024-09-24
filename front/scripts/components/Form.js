import Component from "./Component.js";
import htmlFactory from "../utils/htmlFactory.js";

export default class Form extends Component {
    /**
     *
     * @param {Page} page
     * @param {string} id
     * @param {FormFieldContainer[]} formFieldContainers
     * @param {FormSubmitButton} formSubmitButton
     * @param {function(page: Page, result: Object):void} submitCallback
     */
    constructor({page, id, formFieldContainers, formSubmitButton, submitCallback}) {
        super();

        this.$element = htmlFactory(`
        <form id="${id}">
            <div class="field">
                <div class="control">
                    <!-- FormSubmitButton -->
                </div>
            </div>
        </form>
        `);

        formFieldContainers.reverse().forEach((container) => {
            this.$element.insertAdjacentElement('afterbegin', container.$element);
        });
        Array.from(this.$element.querySelectorAll('.control')).at(-1)
            .appendChild(formSubmitButton.$element);

        this.$element.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (formSubmitButton.isDisabled) {
                return;
            }

            const formData = new FormData(this.$element);
            const result = Object.fromEntries(formData.entries());

            await submitCallback(page, result);
        });
    }
}
