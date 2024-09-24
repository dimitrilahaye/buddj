import Page from "./Page.js";
import htmlFactory from "../utils/htmlFactory";

export default class Receipt extends Page {
    /** @type {FormSubmitButton} */
    #submitButton;

    /**
     *
     * @param {Element} $main
     */
    constructor({$main}) {
        super($main, 'receipt');
    }

    startLoader() {
        this.#submitButton.classList.add('is-loading');
        this.#submitButton.setAttribute('disabled', 'disabled');
    }

    stopLoader() {
        this.#submitButton.classList.remove('is-loading');
        this.#submitButton.removeAttribute('disabled');
    }

    /**
     * @param {function(page: this, result:ReceiptFormResult): void} submitCallback
     * @param {WeeklyBudget[]} weeklyBudgets
     * @param {Numpad} numpad
     */
    updateWeeksSelect(weeklyBudgets, submitCallback, numpad) {
        weeklyBudgets.sort((a, b) => a.name.localeCompare(b.name));

        const currentWeekNumber = this.#getDateWeek(new Date());
        const form$ = htmlFactory(`
            <form id="form">
                <div class="field">
                    <div class="control">
                        <label class="label" for="">
                            <!-- FormField -->
                            <div class="select">
                                <select id="week" name="week">
                                    ${
                                        weeklyBudgets.map((weekly, i) => {
                                            const isSelected = i === currentWeekNumber - 1;
                                            return `<option value="${weekly.id}" ${isSelected ? 'selected="selected"' : ""}>${weekly.name}</option>`;
                                        }).join('')}
                                </select>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="field">
                    <div class="control">
                        <label class="label" for="label">
                            <!-- FormField -->
                            <input required="" id="label" name="label" type="text" autocomplete="off" placeholder="label" class="input" />
                        </label>
                    </div>
                </div>
                <div class="field">
                    <div class="control">
                        <label class="label" for="amount">
                            <!-- FormField -->
                            <input required="" id="amount" name="amount" type="text" autocomplete="off" placeholder="amount" class="input" step="0.01" inputmode="none" />
                        </label>
                    </div>
                </div>
                <div class="field">
                    <div class="control">
                        <!-- FormSubmitButton -->
                        <button class="button is-link" type="submit">Valider</button>
                    </div>
                </div>
            </form>
        `);

        this.$page.insertAdjacentElement('beforeend', form$);
        this.#submitButton = this.$page.querySelector('#form button');
        this.$page.querySelector('#form').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (this.#submitButton.getAttribute('disabled')) {
                return;
            }

            const formData = new FormData(form$);
            const result = Object.fromEntries(formData.entries());

            await submitCallback(this, result);
        });
        numpad.attach({target: document.querySelector('#amount')});
    }

    #getDateWeek(date) {
        const monthStart = new Date(date);
        monthStart.setDate(0);
        const offset = (monthStart.getDay() + 1) % 7 - 1;
        return Math.ceil((date.getDate() + offset) / 7);
    }
}
