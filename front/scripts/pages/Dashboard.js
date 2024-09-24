import Page from "./Page.js";
import WeekDashboard from "../components/WeekDashboard.js";
import MonthDashboard from "../components/MonthDashboard.js";
import DiffDashboard from "../components/DiffDashboard.js";

export default class Dashboard extends Page {
    /** @type {WeekDashboard} */
    #weekDashboard;
    /** @type {MonthDashboard} */
    #monthDashboard;
    /** @type {DiffDashboard} */
    #diffDashboard;
    /** @type {Element} */
    #$monthContainer;
    /** @type {Element} */
    #$weekContainer;
    /** @type {Element} */
    #$monthTab;
    /** @type {Element} */
    #$weekTab;

    /**
     *
     * @param {Element} $main
     * @param {MonthMenu} monthMenu
     */
    constructor({$main, monthMenu}) {
        super($main, 'dashboard');

        this.$page.insertAdjacentHTML('afterbegin', `
            <div class="tabs is-small is-boxed">
              <ul>
                <li id="month-tab" class="is-active">
                  <a>
                    <span class="icon is-small">
                      <i class="fa-solid fa-money-bill-transfer"></i>
                    </span>
                    <span>Compte courant</span>
                  </a>
                </li>
                <li id="week-tab">
                  <a>
                    <span class="icon is-small">
                      <i class="fa-regular fa-credit-card"></i>
                    </span>
                    <span>Budget hebdo</span>
                  </a>
                </li>
              </ul>
            </div>
            <div id="month" class="is-hidden"></div>
            <div id="week" class="is-hidden"></div>
        `);

        this.#$monthContainer = this.$page.querySelector('#month');
        this.#$weekContainer = this.$page.querySelector('#week');

        this.#$monthTab = this.$page.querySelector('#month-tab');
        this.#$monthTab.addEventListener('click', () => {
            this.#$monthTab.classList.toggle('is-active');
            this.#$weekTab.classList.toggle('is-active');
            this.#$monthContainer.classList.toggle('is-hidden');
            this.#$weekContainer.classList.toggle('is-hidden');
        });

        this.#$weekTab = this.$page.querySelector('#week-tab');
        this.#$weekTab.addEventListener('click', () => {
            this.#$monthTab.classList.toggle('is-active');
            this.#$weekTab.classList.toggle('is-active');
            this.#$monthContainer.classList.toggle('is-hidden');
            this.#$weekContainer.classList.toggle('is-hidden');
        });

        this.addMonthMenu(monthMenu, {
            title: 'Dashboard',
            icon: 'square-poll-vertical',
        });
    }

    /**
     *
     * @param {*} dashboard
     */
    displayWeekDashboard(dashboard) {
        if (this.#weekDashboard !== undefined) {
            this.$page.removeChild(this.#weekDashboard.$element);
            this.$page.removeChild(this.#monthDashboard.$element);
            this.$page.removeChild(this.#diffDashboard.$element);
        }
        const weekBlockProps = this.#buildWeekDashboardProps(dashboard.weeks);
        this.#weekDashboard = new WeekDashboard(weekBlockProps);
        this.#monthDashboard = new MonthDashboard(dashboard.account);
        this.#diffDashboard = new DiffDashboard(dashboard.weeks);

        this.#$monthContainer.append(this.#monthDashboard.$element);
        this.#$weekContainer.append(this.#weekDashboard.$element, this.#diffDashboard.$element);

        this.loader.stop();
        this.$page.querySelector('.title.is-2').classList.remove('is-hidden');
        this.#$monthContainer.classList.remove('is-hidden');
    }

    /**
     *
     * @param {*} weeks
     */
    #buildWeekDashboardProps(weeks) {
        const weeksProps = weeks.weeklyBudgets.map((week) => {
            return {
                week: week.weekName,
                remaining: week.currentBalance.toFixed(2),
                color: week.currentBalance < 0 ? 'is-danger' : 'is-success',
                size: week.weekName === 'Semaine 5' ? null : 'is-half',
            };
        });
        weeksProps.sort((a, b) => {
            return a.week.localeCompare(b.week);
        });

        return weeksProps;
    }
}
