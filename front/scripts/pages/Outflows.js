import Page from "./Page.js";
import htmlFactory from "../utils/htmlFactory";

export default class Outflows extends Page {
    /** @type {Element} */
    #submitManageOutflowButton;
    /** @type {Element} */
    #submitAddOutflowButton;
    /** @type {function(page: Page, result: *): void} */
    #updateOutflowsHandler;
    /** @type {PendingResult[]} */
    outflows;
    /** @type {Element} */
    #$manageContainer;
    /** @type {Element} */
    #$addContainer;
    /** @type {Element} */
    #$manageTab;
    /** @type {Element} */
    #$addTab;

    /**
     *
     * @param {Element} $main
     * @param {MonthMenu} monthMenu
     * @param {function(page: Page, result: *): void} updateOutflowsHandler
     */
    constructor({$main, updateOutflowsHandler, monthMenu}) {
        super($main, 'outflows');

        this.#updateOutflowsHandler = updateOutflowsHandler;

        this.$page.insertAdjacentHTML('afterbegin', `
            <div class="searchForOutflowsContainer field is-grouped is-hidden">
                <div class="control is-expanded">
                    <!-- select fileForPending -->
                </div>
                <p class="control">
                    <!-- button searchForPending -->
                </p>
            </div>
            <!-- Form -->
        `);

        this.addMonthMenu(monthMenu, {
            title: 'Entrées / Sorties',
            icon: 'money-bill-transfer',
        });
    }

    /**
     * @param {OutflowsData} data
     * @param {Numpad} numpad
     * @param {function(page: this, result:OutflowFormResult): void} addOutflowCallback
     * @param {function(page: this, outflowId: string)} deleteOutflowHandler
     */
    displayForm({currentBalance, outflows}, numpad, deleteOutflowHandler, addOutflowCallback) {
        this.$page.querySelector('#manage-outflow-form')?.remove();

        this.outflows = outflows;
        this.outflows.sort((a, b) => a.isChecked - b.isChecked || a.label.localeCompare(b.label));

        this.$page.insertAdjacentHTML('beforeend', `
            <div class="tabs is-boxed is-small">
              <ul>
                <li id="manage" class="is-active">
                  <a>
                    <span class="icon is-small"
                      ><i class="fas fa-gear" aria-hidden="true"></i
                    ></span>
                    <span>Gérer</span>
                  </a>
                </li>
                <li id="add">
                  <a>
                    <span class="icon is-small"
                      ><i class="fas fa-plus" aria-hidden="true"></i
                    ></span>
                    <span>Ajouter</span>
                  </a>
                </li>
              </ul>
            </div>
            <div id="outflows"></div>
            <div id="add-outflow" class="is-hidden"></div>
        `);

        this.#insertOutflowsManageTabContent(currentBalance, numpad, deleteOutflowHandler);
        this.#insertAddOutflowTabContent(numpad, addOutflowCallback);

        this.$page.querySelector('.tabs.is-boxed').insertAdjacentElement('beforebegin', this.loader.$element);

        this.#$manageContainer = this.$page.querySelector('#outflows');
        this.#$addContainer = this.$page.querySelector('#add-outflow');

        this.#$manageTab = this.$page.querySelector('#manage');
        this.#$manageTab.addEventListener('click', () => {
            this.#$manageTab.classList.toggle('is-active');
            this.#$addTab.classList.toggle('is-active');
            this.#$manageContainer.classList.toggle('is-hidden');
            this.#$addContainer.classList.toggle('is-hidden');
        });

        this.#$addTab = this.$page.querySelector('#add');
        this.#$addTab.addEventListener('click', () => {
            this.#$manageTab.classList.toggle('is-active');
            this.#$addTab.classList.toggle('is-active');
            this.#$manageContainer.classList.toggle('is-hidden');
            this.#$addContainer.classList.toggle('is-hidden');
        });

        this.loader.stop();
    }

    /**
     * @param {function(page: this, result:OutflowFormResult): void} addOutflowCallback
     * @param {Numpad} numpad
     */
    #insertAddOutflowTabContent(numpad, addOutflowCallback) {
        const $form = htmlFactory(`
            <form id="add-outflow-form">
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

        this.$page.querySelector('#add-outflow').insertAdjacentElement('beforeend', $form);
        this.#submitAddOutflowButton = this.$page.querySelector('#add-outflow-form button');
        this.$page.querySelector('#add-outflow-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (this.#submitAddOutflowButton.getAttribute('disabled')) {
                return;
            }

            const formData = new FormData($form);
            const result = Object.fromEntries(formData.entries());

            await addOutflowCallback(this, result);
        });
        numpad.attach({target: document.querySelector('#amount')});
    }

    #insertOutflowsManageTabContent(currentBalance, numpad, deleteOutflowHandler) {
        this.$page.querySelector('#outflows').insertAdjacentHTML('beforeend', `
            <form id="manage-outflow-form">
                <div class="field has-addons">
                    <div class="control">
                        <span class="button is-link">Solde courant</span>
                    </div>
                    <div class="control">
                        <label class="label" for="remaining">
                            <input required id="remaining" value="${currentBalance}" name="remaining" type="text" placeholder="Remaining" class="input" />
                        </label>
                    </div>
                </div>
              <div id="outflows-container">
              ${this.outflows.map((p) => {
            return `
                <div class="field">
                    <div class="control">
                      <div class="header-container">
                          <span class="icon delete" data-outflow-id="${p.id}">
                            <i class="fa-solid fa-times"></i>
                          </span>
                      </div>
                      <label class="outflow checkbox" for="${p.id}">
                        <span class="name">${p.label}</span>
                        <span class="amount">${p.amount}€</span>
                        <input id="${p.id}" name="${p.id}" type="checkbox" class="checkbox is-checked" ${p.isChecked ? 'checked' : ''}>
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
        numpad.attach({target: document.getElementById('remaining')});

        const $outflowBlocks = this.$page.querySelectorAll('#outflows-container .outflow.checkbox');
        Array.from($outflowBlocks).forEach(($block) => {
           $block.addEventListener('click', function() {
              $block.dataset.clicked = 'true';
           });
        });
        this.#submitManageOutflowButton = this.$page.querySelector('#manage-outflow-form button[type="submit"]');
        this.$page.querySelector('#manage-outflow-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (this.#submitManageOutflowButton.getAttribute('disabled')) {
                return;
            }

            const $container = this.$page.querySelector('#outflows-container');
            const $labels = $container.querySelectorAll('.field .control label.checkbox[data-clicked]');
            const outflows = Array.from($labels).map(($label) => {
                const id = $label.querySelector('.is-checked').id;
                const isChecked = $label.querySelector('.is-checked').checked;
                return {
                    id, isChecked,
                }
            });
            const newCurrentBalance = this.$page.querySelector('#remaining').value;
            const result = {
                currentBalance: Number(newCurrentBalance),
                outflows,
            };

            await this.#updateOutflowsHandler(this, result);
        });

        this.$page.querySelector('.searchForOutflowsContainer').classList.remove('is-hidden');

        const $confirmDelete = this.$page.querySelector('.confirm-delete');
        const $cancelDelete = this.$page.querySelector('.cancel-delete');
        $cancelDelete.addEventListener('click', () => {
            $confirmDelete.classList.add('is-hidden');
            $cancelDelete.classList.add('is-hidden');
            this.#submitManageOutflowButton.classList.remove('is-hidden');
            const $deleteButton = this.$page.querySelector('#manage-outflow-form .icon.delete[data-selected="true"]');
            $deleteButton.removeAttribute('data-selected');
        });
        $confirmDelete.addEventListener('click', async () => {
            $confirmDelete.classList.add('is-hidden');
            $cancelDelete.classList.add('is-hidden');
            this.#submitManageOutflowButton.classList.remove('is-hidden');
            const $deleteButton = this.$page.querySelector('#manage-outflow-form .icon.delete[data-selected="true"]');
            const outflowId = $deleteButton.dataset.outflowId;
            await deleteOutflowHandler(this, outflowId);
        });
        this.$page.querySelectorAll('#manage-outflow-form .icon.delete').forEach(($deleteButton) => {
            $deleteButton.addEventListener('click', () => {
                $deleteButton.dataset.selected = 'true';
                $confirmDelete.classList.remove('is-hidden');
                $cancelDelete.classList.remove('is-hidden');
                this.#submitManageOutflowButton.classList.add('is-hidden');
            });
        });
    }

    startManageOutflowsSubmitLoader() {
        this.#submitManageOutflowButton.setAttribute('disabled', 'disabled');
        this.#submitManageOutflowButton.classList.add('is-loading');
    }

    stopManageOutflowsSubmitLoader() {
        this.#submitManageOutflowButton.removeAttribute('disabled');
        this.#submitManageOutflowButton.classList.remove('is-loading');
    }

    startAddOutflowSubmitLoader() {
        this.#submitAddOutflowButton.classList.add('is-loading');
        this.#submitAddOutflowButton.setAttribute('disabled', 'disabled');
    }

    stopAddOutflowSubmitLoader() {
        this.#submitAddOutflowButton.classList.remove('is-loading');
        this.#submitAddOutflowButton.removeAttribute('disabled');
    }
}
