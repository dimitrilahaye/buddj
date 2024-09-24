import Page from "./Page.js";

export default class Pending extends Page {
    /** @type {Element} */
    #submitButton;
    /** @type {function(page: Page, result: *): void} */
    #updatePendingHandler;
    /** @type {PendingResult[]} */
    pending;
    /** @type {WeeklyBudget[]} */
    weeklyBudgets;

    /**
     *
     * @param {Element} $main
     * @param {function(page: Page, result: *): void} updatePendingHandler
     */
    constructor({$main, updatePendingHandler}) {
        super($main, 'pending');

        this.#updatePendingHandler = updatePendingHandler;
    }

    /**
     * @param {function(page: this, weekId: string, expenseId: string)} deleteExpenseHandler
     * @param {WeeklyBudget[]} weeklyBudgets
     */
    displayForm({weeklyBudgets, deleteExpenseHandler}) {
        this.$page.querySelector('#form')?.remove();
        this.weeklyBudgets = weeklyBudgets;
        this.pending = weeklyBudgets.flatMap((weekly) => {
            return weekly.expenses.map((expense) => ({
                id: expense.id,
                weekId: weekly.id,
                weekName: weekly.name,
                label: expense.label,
                amount: expense.amount,
                isChecked: expense.isChecked,
            }));
        });
        this.pending.sort((a, b) => b.weekName.localeCompare(a.weekName) || a.isChecked - b.isChecked || a.label.localeCompare(b.label));

        this.$page.insertAdjacentHTML('beforeend', `
            <form id="form">
              <div id="pending-container">
              ${this.pending.map((p) => {
            return `
                <div class="field">
                    <div class="control">
                      <div class="header-container">
                          <span class="week">${p.weekName.replace('Semaine ', '#')}</span>
                          <span class="icon delete" data-expense-id="${p.id}">
                            <i class="fa-solid fa-times"></i>
                          </span>
                      </div>
                      <label class="expense checkbox" for="${p.id}">
                        <span class="label">${p.label.replace('[CB] ', '')}</span>
                        <span class="amount">${p.amount}€</span>
                        <input id="${p.id}" name="${p.id}" type="checkbox" class="checkbox" ${p.isChecked ? 'checked' : ''}>
                      </label>
                    </div>
                </div>`
        }).join('')}
              </div>
              <div class="field">
                <div class="control">
                      <!-- FormSubmitButton -->
                    <button class="button is-link submit" type="submit">Valider</button>
                    <button class="button is-warning confirm-delete is-hidden" type="button">Confirmer la suppression</button>
                    <button class="button is-info is-light cancel-delete is-hidden" type="button">Abandonner la suppression</button>
                </div>
              </div>
            </form>`);

        const $expenseBlocks = this.$page.querySelectorAll('#pending-container .expense.checkbox');
        Array.from($expenseBlocks).forEach(($block) => {
            $block.addEventListener('click', function () {
                $block.dataset.clicked = 'true';
            });
        });

        this.#submitButton = this.$page.querySelector('#form button[type="submit"]');
        this.$page.querySelector('#form').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (this.#submitButton.getAttribute('disabled')) {
                return;
            }

            const $form = this.$page.querySelector('#form');
            const $fields = $form.querySelectorAll('#pending-container .field .control label.checkbox[data-clicked]');
            const expenses = Array.from($fields).map(($element) => {
                const id = $element.querySelector('input.checkbox').id;
                const label = $element.querySelector('span.label').innerText;
                const amount = $element.querySelector('span.amount').innerText;
                const isChecked = $element.querySelector('input.checkbox').checked;
                return {
                    id,
                    label,
                    amount,
                    isChecked,
                };
            });
            const result = [];
            expenses.forEach((expense) => {
                const pending = this.pending.find((p) => p.id === expense.id);
                const weekly = this.weeklyBudgets.find((weekly) => weekly.id === pending.weekId);
                const existingWeeklyResult = result.find(({id}) => id === weekly.id);
                if (!existingWeeklyResult) {
                    result.push({
                        id: weekly.id,
                        expenses: [{
                            id: expense.id,
                            isChecked: expense.isChecked,
                        }],
                    })
                }
                if (existingWeeklyResult) {
                    existingWeeklyResult.expenses.push({
                        id: expense.id,
                        isChecked: expense.isChecked,
                    });
                }
            });

            await this.#updatePendingHandler(this, result);
        });

        const $confirmDelete = this.$page.querySelector('.confirm-delete');
        const $cancelDelete = this.$page.querySelector('.cancel-delete');
        $cancelDelete.addEventListener('click', () => {
            $confirmDelete.classList.add('is-hidden');
            $cancelDelete.classList.add('is-hidden');
            this.#submitButton.classList.remove('is-hidden');
            const $deleteButton = this.$page.querySelector('#form .icon.delete[data-selected="true"]');
            $deleteButton.removeAttribute('data-selected');
        });
        $confirmDelete.addEventListener('click', async () => {
            $confirmDelete.classList.add('is-hidden');
            $cancelDelete.classList.add('is-hidden');
            this.#submitButton.classList.remove('is-hidden');
            const $deleteButton = this.$page.querySelector('#form .icon.delete[data-selected="true"]');
            const expenseId = $deleteButton.dataset.expenseId;
            const {weekId} = this.pending.find((expense) => expense.id === expenseId);
            await deleteExpenseHandler(this, weekId, expenseId);
        });
        this.$page.querySelectorAll('#form .icon.delete').forEach(($deleteButton) => {
            $deleteButton.addEventListener('click', () => {
                $deleteButton.dataset.selected = 'true';
                $confirmDelete.classList.remove('is-hidden');
                $cancelDelete.classList.remove('is-hidden');
                this.#submitButton.classList.add('is-hidden');
            });
        });
    }

    startSubmitLoader() {
        this.#submitButton.setAttribute('disabled', 'disabled');
        this.#submitButton.classList.add('is-loading');
    }

    stopSubmitLoader() {
        this.#submitButton.removeAttribute('disabled');
        this.#submitButton.classList.remove('is-loading');
    }
}
