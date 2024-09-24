import Page from "./Page.js";
import htmlFactory from "../utils/htmlFactory";
import uuid from "../utils/uuid";

export default class CreateMonth extends Page {
    /** @type {Element} */
    #submitButton;
    /** @type {Element} */
    #$form;
    /** @type {*} */
    #template;
    /** @type {Numpad} */
    #numpad;

    /**
     *
     * @param {Element} $main
     */
    constructor({$main}) {
        super($main, 'create-month');

        this.$page.insertAdjacentHTML('afterbegin', `
            <h2 class="title is-2"><i class="fa-solid fa-calendar-days"></i>&nbsp;Nouveau mois</h2>
            <form id="form">

            </form>
        `);

        this.#$form = this.$page.querySelector('#form');

        this.$page.querySelector('.title.is-2').insertAdjacentElement('afterend', this.loader.$element);
    }

    initializeTemplate(template, numpad, createMonthSubmitHandler) {
        this.#template = template;
        this.#numpad = numpad;
        const date = new Date(template.month);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const monthString = year + '-' + (month < 10 ? '0' + month : month);
        const $body = htmlFactory(`
            <div class="field is-horizontal">
                <div class="field-body"></div>
            </div>
        `);
        const monthField = htmlFactory(`
            <div class="field">
              <div class="control">
                <label class="label">
                    <input
                      autocomplete="off"
                      required
                      id="month"
                      name="month"
                      type="month"
                      placeholder="Mois"
                      class="input"
                      value="${monthString}"
                      min="${monthString}"
                    >
                </label>
              </div>
            </div>
        `);
        $body.querySelector('.field-body').appendChild(monthField);
        const startingBalanceField = htmlFactory(`
            <div class="field">
              <div class="control">
                <label class="label" for="">
                    <input required value="${template.startingBalance}" id="initialAmount" name="initialAmount" placeholder="Solde initial" type="number" class="input" step="0.01">
                </label>
              </div>
            </div>
        `);
        $body.querySelector('.field-body').appendChild(startingBalanceField);
        this.#$form.appendChild($body);

        const weeklyTitle = htmlFactory(`
            <h2 class="weekly-title title is-3"><i class="fa-solid fa-credit-card"></i>&nbsp;Sorties hebdo</h2>
        `);
        this.#$form.appendChild(weeklyTitle);

        this.#generateOutflowsContainer();

        const weeklyContainer = htmlFactory(`
            <div id="weekly" class="items-container">
                  ${template.weeklyBudgets.map((week, i) => {
            return `
                    <div class="field">
                        <div class="control">
                          <label for="${i}">
                            <span>${week.name}</span>
                            <span>${week.initialBalance}€</span>
                          </label>
                        </div>
                    </div>`
        }).join('')}
            </div>
        `);
        this.#$form.appendChild(weeklyContainer);

        this.#$form.querySelectorAll('#weekly .field').forEach(($field) => {
            $field.addEventListener('click', (e) => {
                const field = e.target.closest('.field');
                const index = field.querySelector('.control label').getAttribute('for');
                const name = field.querySelector('.control span').innerText;
                const initialBalance = field.querySelector('.control span + span').innerText.replace('€', '');
                field.setAttribute('data-is-selected', 'selected');
                this.#displayWeeklyEditor({index, name, initialBalance}, numpad);
            });
        });

        this.$page.querySelector('#month').addEventListener('click', (e) => {
            e.target.showPicker();
        });
        numpad.attach({target: document.getElementById('initialAmount')});

        const submit = htmlFactory(`
          <div class="field">
            <div class="control">
              <!-- FormSubmitButton -->
              <button class="button is-link" type="submit">Créer</button>
            </div>
          </div>
        `);
        this.#$form.appendChild(submit);

        this.#submitButton = this.$page.querySelector('#form button[type="submit"]');
        this.$page.querySelector('#form').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (this.#submitButton.getAttribute('disabled')) {
                return;
            }

            const formData = new FormData(this.$page.querySelector('#form'));
            const result = Object.fromEntries(formData.entries());

            this.#template = {
                ...this.#template,
                month: new Date(result.month),
                startingBalance: Number(result.initialAmount),
            }
            await createMonthSubmitHandler(this, this.#template);
        });

        this.loader.stop();
    }

    #generateOutflowsContainer() {
        this.#$form.querySelector('#outflows')?.remove();
        this.#$form.querySelector('.outflows-title')?.remove();

        const outflowsTitle = htmlFactory(`
            <h2 class="outflows-title title is-3"><i class="fa-solid fa-money-bill-transfer"></i>&nbsp;Sorties mensuelles</h2>
        `);
        this.#$form.querySelector('.weekly-title').insertAdjacentElement('beforebegin', outflowsTitle);

        const outflowsContainer = htmlFactory(`
            <div id="outflows" class="items-container">
                  ${this.#template.outflows.map((outflow, i) => {
            return `
                    <div class="field">
                        <div class="control">
                          <label for="${i}">
                            <span>${outflow.label}</span>
                            <span>${outflow.amount}€</span>
                          </label>
                        </div>
                    </div>`
        }).join('')}
              <div id="new-outflow" class="new-item field">
                    <div class="control">
                        <button class="button" type="button">
                            <span class="icon"><i class="fa-solid fa-plus"></i></span>
                        </button> 
                    </div>
                </div> 
            </div>
        `);
        this.#$form.querySelector('.outflows-title').insertAdjacentElement('afterend', outflowsContainer);

        this.#$form.querySelector('#new-outflow .control button').addEventListener('click', () => {
            this.#displayAddOutflowsEditor(this.#numpad);
        });

        this.#$form.querySelectorAll('#outflows .field:not(#new-outflow)').forEach(($field) => {
            $field.addEventListener('click', (e) => {
                const field = e.target.closest('.field');
                const index = field.querySelector('.control label').getAttribute('for');
                const label = field.querySelector('.control span').innerText;
                const amount = field.querySelector('.control span + span').innerText.replace('€', '');
                field.setAttribute('data-is-selected', 'selected');
                this.#displayOutflowsEditor({index, amount, label}, this.#numpad);
            });
        });
    }

    #displayWeeklyEditor(week, numpad) {
        const editWeeklyBlock = htmlFactory(`
            <div id="edit-item">
                <div class="edit-item-container">
                  <div class="field has-addons">
                    <div class="control week">
                      <span class="button is-danger">
                        ${week.name}
                      </span>
                    </div>
                    <div class="control">
                      <input required id="${week.name}" name="${week.name}" value="${week.initialBalance}" type="text" class="input">
                    </div>
                  </div>
                  <button type="button" class="button is-info">Valider</button>
                </div>
            </div>
        `);
        this.#$form.appendChild(editWeeklyBlock);
        setTimeout(() => {
            numpad.attach({target: document.getElementById(week.name)});
            this.#$form.querySelector('#edit-item').addEventListener('click', (e) => {
                const isClickedOnPad = e.target.closest('.edit-item-container');
                if (!isClickedOnPad) {
                    this.#$form.removeChild(e.target);
                }
            });
            this.#$form.querySelector('#edit-item .edit-item-container .button.is-info').addEventListener('click', (e) => {
                const container = e.target.closest('.edit-item-container');
                const initialBalance = container.querySelector('.field .control + .control input').value;
                this.#$form.removeChild(this.#$form.querySelector('#edit-item'));
                const selectedField = this.#$form.querySelector('#weekly .field[data-is-selected]');
                const initialBalanceSpan = selectedField.querySelector('.control label span + span');
                initialBalanceSpan.innerText = initialBalance + '€';
                selectedField.removeAttribute('data-is-selected');
                const originalWeekly = this.#template.weeklyBudgets[week.index];
                this.#template.weeklyBudgets[week.index] = {
                    ...originalWeekly,
                    initialBalance: Number(initialBalance),
                }
            });
        }, 500);
    }

    #displayOutflowsEditor(outflow, numpad) {
        const editOutflowBlock = htmlFactory(`
            <div id="edit-item">
                <div class="edit-item-container">
                    <div class="field">
                        <div class="fields">
                            <div class="control">
                              <input required id="label" name="label" value="${outflow.label}" type="text" class="input">
                            </div>
                            <div class="control">
                              <input required id="${outflow.label}" name="${outflow.label}" value="${outflow.amount}" type="text" class="input">
                            </div>
                        </div>
                    </div>
                    <div class="buttons">
                        <button type="button" class="button is-danger">Supprimer</button>
                        <button type="button" class="button is-info">Valider</button>
                    </div>
                </div>
            </div>
        `);
        this.#$form.appendChild(editOutflowBlock);
        setTimeout(() => {
            numpad.attach({target: document.getElementById(outflow.label)});
            this.#$form.querySelector('#edit-item').addEventListener('click', (e) => {
                const isClickedOnPad = e.target.closest('.edit-item-container');
                if (!isClickedOnPad) {
                    this.#$form.removeChild(e.target);
                }
            });
            this.#$form.querySelector('#edit-item .edit-item-container .button.is-info').addEventListener('click', (e) => {
                const container = e.target.closest('.edit-item-container');
                const label = container.querySelector('.field .control input').value;
                const amount = container.querySelector('.field .control + .control input').value;
                this.#$form.removeChild(this.#$form.querySelector('#edit-item'));
                const selectedField = this.#$form.querySelector('#outflows .field[data-is-selected]');
                const labelSpan = selectedField.querySelector('.control label span');
                const amountSpan = selectedField.querySelector('.control label span + span');
                labelSpan.innerText = label;
                amountSpan.innerText = amount + '€';
                selectedField.removeAttribute('data-is-selected');
                this.#template.outflows[outflow.index] = {
                    amount: Number(amount),
                    label,
                    isChecked: false
                };
            });
            this.#$form.querySelector('#edit-item .edit-item-container .button.is-danger').addEventListener('click', (e) => {
                this.#$form.removeChild(this.#$form.querySelector('#edit-item'));
                const selectedField = this.#$form.querySelector('#outflows .field[data-is-selected]');
                this.#$form.querySelector('#outflows').removeChild(selectedField);
                this.#template.outflows.splice(outflow.index, 1);
            });
        }, 500);
    }

    #displayAddOutflowsEditor(numpad) {
        const id = uuid();
        const addOutflowBlock = htmlFactory(`
            <div id="edit-item">
                <div class="edit-item-container">
                    <div class="field">
                        <div class="fields">
                            <div class="control">
                              <input required id="label" name="label" type="text" placeholder="label" class="input">
                            </div>
                            <div class="control">
                              <input required id="${id}" name="${id}" value="0" type="text" class="input">
                            </div>
                        </div>
                    </div>
                    <button type="button" class="button is-info">Valider</button>
                </div>
            </div>
        `);
        this.#$form.appendChild(addOutflowBlock);
        setTimeout(() => {
            numpad.attach({target: document.getElementById(id)});
            this.#$form.querySelector('#edit-item').addEventListener('click', (e) => {
                const isClickedOnPad = e.target.closest('.edit-item-container');
                if (!isClickedOnPad) {
                    this.#$form.removeChild(e.target);
                }
            });
            this.#$form.querySelector('#edit-item .edit-item-container .button.is-info').addEventListener('click', (e) => {
                const container = e.target.closest('.edit-item-container');
                const label = container.querySelector('.field .control input').value;
                const amount = container.querySelector('.field .control + .control input').value;
                this.#$form.removeChild(this.#$form.querySelector('#edit-item'));
                const newOutflow = {
                    amount: Number(amount),
                    label,
                    isChecked: false,
                }
                this.#template.outflows.push(newOutflow);
                this.#generateOutflowsContainer();
            });
        }, 500);
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
